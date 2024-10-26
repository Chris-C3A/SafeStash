from flask import Flask, request, jsonify, session
from flask_cors import CORS
from dotenv import load_dotenv
import os
import uuid
from database import connect_supabase
from services.momo import MomoApi, MomoApiUser
from services.stellar import get_stellar_balance, stellarApp, generate_key_pair,handle_momo_payment, transfer_to_stellar
from werkzeug.security import generate_password_hash, check_password_hash
from services.momo import MomoApi
from datetime import datetime

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.register_blueprint(stellarApp, url_prefix='/stellar-app')
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# create an instance of the MomoApi class
momo_api = MomoApi(
  "https://sandbox.momodeveloper.mtn.com/v1_0",
  os.getenv('MTN_MOMO_SUBSCRIPTION_KEY')
)


@app.route('/hello')
def hello_stellar():
  return "Hello Stellar"
  

@app.route('/momo-test')
def momo_test():
  # generate a unique identifier for the user
  user_id = str(uuid.uuid4())

  status_code = momo_api.create_api_user(user_id)
  api_key = momo_api.create_api_key(user_id)
  print(api_key)

  momo_api_user = MomoApiUser(
    "https://sandbox.momodeveloper.mtn.com",
    os.getenv('MTN_MOMO_SUBSCRIPTION_KEY'),
    user_id,
    api_key,
  )

  # create access token
  status_code, response = momo_api_user.create_token()
  print(momo_api_user.access_token)
  print(user_id)

  return {
    'status_code': status_code,
    'response': response,
    'access_token': momo_api_user.access_token,
    'user_id': user_id
  }

@app.route('/momo-callback', methods=['POST'])
def momo_callback():
  data = request.json

  if data.get('status') == 'SUCCESSFUL':
    print('Payment was successful')

    print(data)

    # exchange and transfer ammount to stellar wallet

  return jsonify({'message': 'Callback received'}), 200


@app.route('/register-user', methods=['POST'])
def register_user():
    data = request.get_json()
    phone_Number = data.get('phonenumber')
    username = data.get('username')
    password = data.get('password')

    if not phone_Number or not username or not password:
        return jsonify({
            "error": "Please provide phone number, username, and password"
        }), 400

    hashed_password = generate_password_hash(password)

    supabase = connect_supabase()

    try:
      # create key pair and put on testnet

      response = supabase.table('users').insert({
          "phonenumber": phone_Number,
          "username": username,
          "password": hashed_password
      }).execute()

      user_id = response.data[0]["id"]
      # print(user)

      keyPair = generate_key_pair()

      supabase.table('wallet').insert({
          "publicKey": keyPair['public_key'],
          "privateKey": keyPair['secret_key'], #TODO encrypt it
          "user_id": user_id
      }).execute()

      if response.data:
          return jsonify({
              "message": "User registered successfully",
              "user": response.data[0]
          }), 201
      else:
          return jsonify({
              "error": "Failed to register user"
          }), 500

    except Exception as e:
        return jsonify({
            "error": f"Database error: {str(e)}"
        }), 500


@app.route('/login', methods=['POST'])
def login_user():
  data = request.get_json()
  username = data.get('username')
  password = data.get('password')

  if not username or not password:
    return jsonify({
      "status" : "error", 
      "message": "Pleaser provide username and password"
    }), 400
  
  supabase = connect_supabase()

  try:

    response = supabase.table('users').select('*').eq('username', username).execute()
    #check if the user exists
    if not response.data or len(response.data) == 0:
      return jsonify({
        "status" : "error", 
        "message" : "User not found"
      }), 404

    
    user = response.data[0]

    #verify password
    if check_password_hash(user['password'], password):
      session['user_id'] = user['id']
      session['username'] = username

      user_data = {
        "id" : user['id'],
        "username" : user['username'],
        "phonenumber" : user['phonenumber']
      }

      return jsonify({
        "status" : "success",
        "message" : "Login Successful",
        "user" : user_data
      }), 200
    else:
      return jsonify({
        "status" : "error",
        "message" : "Invalid Password"
      }), 401

  except Exception as e:
     return jsonify({
      "status" : "error",
      "message" : f"Login Error: {str(e)}"
     }), 500

@app.route('/logout', methods=['GET'])
def logout():
    session.pop('username', None)
    return jsonify({"message": "User logged out"}), 200


@app.route('/check-session', methods=['GET'])
def check_session():
    if 'username' in session:
        return jsonify({"logged_in": True, "username": session['username']})
    return jsonify({"logged_in": False}), 401



@app.route('/deposit', methods=['POST'])
def deposit():
  username = session['username']
  # request
  '''
  {
    "amount": 1000
    "currency": "USD"
    "mobile_money_number": "256700000000"
  }
  '''

  data = request.get_json()

  

  # momo api
  supabase = connect_supabase()
  response = supabase.table('users').select('*').eq('username', username).execute()
  wallet_response = supabase.table('wallet').select('*').eq('user_id', response.data[0]['id']).execute()


  user = response.data[0]

  if data['phone_number'] != user['phonenumber']:
    return jsonify({"message": "Please enter the correct phone number you registered with"}), 400
     

  user_id = user['id']

  momo_api.create_api_user(user_id)
  api_key = momo_api.create_api_key(user_id)

  momo_api_user = MomoApiUser(
    "https://sandbox.momodeveloper.mtn.com",
    os.getenv('MTN_MOMO_SUBSCRIPTION_KEY'),
    user_id,
    api_key,
  )

  # create access token
  status_code, response = momo_api_user.create_token()

  status_code, response = momo_api_user.create_request_to_pay(
    amount=data["amount"],
    currency=data["currency"],
    external_id=str(uuid.uuid4()),
    payer_message="Deposit to Stellar Wallet",
    payee_note="Deposit to Stellar Wallet",
    payer_number=data['phone_number']
  )

  print("jdklfasfdsfdsfsdfsd")
  print(data["amount"])
  # stellar
  handle_momo_payment(data["amount"], data["currency"], wallet_response.data[0]['publicKey'])

  #Log Transaction
  log_transaction(user_id, "Deposit", data["amount"], status="Completed")

  # Get user ID
  # username = session['username']
  return jsonify({"message": "Deposit successful"}), 200

@app.route('/withdraw', methods=['POST'])
def withdraw():
  username = session['username']
  data = request.get_json()
  amount = data.get("amount")
  currency = data.get("currency")
  momo_number = data.get("phone_number")

  supabase = connect_supabase()
  response = supabase.table('users').select('*').eq('username', username).execute()
  wallet_response = supabase.table('wallet').select('*').eq('user_id', response.data[0]['id']).execute()

  user = response.data[0]

  user_id = user['id']

  # withdraw from stellar wallet
  # withdraw_to_momo(amount, wallet_response.data[0]['publicKey'], momo_number)
  transfer_to_stellar(amount, wallet_response.data[0]['publicKey'], wallet_response.data[0]['privateKey'])

  momo_api.create_api_user(user_id)
  api_key = momo_api.create_api_key(user_id)

  momo_api_user = MomoApiUser(
    "https://sandbox.momodeveloper.mtn.com",
    os.getenv('MTN_MOMO_SUBSCRIPTION_KEY'),
    user_id,
    api_key,
  )

  # create access token
  status_code, response = momo_api_user.create_token()

  # withdraw to momo
  status_code, response = momo_api_user.withdraw(
    amount=amount,
    currency=currency,
    external_id=str(uuid.uuid4()),
    payer_message="Withdraw from Stellar Wallet",
    payee_note="Withdraw from Stellar Wallet",
    payee_number=momo_number
  )

  # Log transaction
  log_transaction(user_id, "Withdrawal", amount, status="Completed")

  return jsonify(response)
  
@app.route('/balance')
def get_balance():
  username = session['username']
  supabase = connect_supabase()

  response = supabase.table('users').select('*').eq('username', username).execute()

  print("User ID")
  print(response.data[0]['id'])

  wallet_response = supabase.table('wallet').select('*').eq('user_id', response.data[0]['id']).execute()
  print(wallet_response)

  balance = get_stellar_balance(wallet_response.data[0]['publicKey'])

  return jsonify({"balance": balance, "public_key": wallet_response.data[0]['publicKey']})


@app.route('/transactions')
def get_transactions():
  username = session['username']
  supabase = connect_supabase()

  response = supabase.table('users').select('*').eq('username', username).execute()

  user_id = response.data[0]['id']

  transaction_response = supabase.table('transaction_history').select('*').eq('user_id', user_id).order('date', desc=True).execute()

  return jsonify(transaction_response.data)



def log_transaction(user_id, description, amount, status="Completed"):
  supabase = connect_supabase()  
  transaction_data = {
      "user_id": user_id,
      "date": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
      "description": description,
      "amount": amount,
      # "currency": currency,
      "status": status
  }
  print("Transaction Data")
  supabase.table('transaction_history').insert(transaction_data).execute()



   

if __name__ == "__main__":
  app.run(debug=True, host="0.0.0.0")