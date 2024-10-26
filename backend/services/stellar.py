
# stellarApp = Blueprint('stellarApp', __name__)
# CORS(stellarApp)

# load_dotenv()

# STELLAR_TESTNET_SERVER = "https://horizon-testnet.stellar.org"
# server = Server(STELLAR_TESTNET_SERVER)

# #Account to receive funds from customer
# RECEIVING_STELLAR_PUBLIC_KEY = os.getenv("RECEIVING_STELLAR_PUBLIC_KEY")
# RECEIVING_STELLAR_SECRET_KEY = os.getenv("RECEIVING_STELLAR_SECRET_KEY")

# # Create Stellar Keypair Object for receiving account
# stellar_keypair = Keypair.from_secret(RECEIVING_STELLAR_SECRET_KEY)

# # USDC Asset to buy USDC using Center Consortium USDC ISSUER PUBLIC TESTNET KEY
# USDC = Asset("USDC", os.getenv("CENTER_CONSORTIUM_USDC_ISSUER_ACCOUNT"))
# XLM = Asset("XLM", os.getenv("CENTER_CONSORTIUM_USDC_ISSUER_ACCOUNT"))

# def convert_and_transfer_usdc(amount, currency, customer_stellar_account):
#     try:
#         # Determine USDC amount based on exchange rate
#         # (For demonstration, assume 1:1 conversion rate if the currency is USD)
#         usdc_amount = amount  # Adjust this with an actual exchange rate conversion if needed

#         # Load your receiving Stellar account to create the transaction
#         receiving_account = server.load_account(RECEIVING_STELLAR_PUBLIC_KEY)

#         print("HEREEe")

#         # Create and sign a transaction to send USDC to the customer
#         transaction = (
#             TransactionBuilder(
#                 source_account=receiving_account,
#                 network_passphrase=Network.TESTNET_NETWORK_PASSPHRASE,
#                 base_fee=100
#             )
#             .append_payment_op(
#                 destination=customer_stellar_account,
#                 amount=str(usdc_amount),
#                 asset=USDC
#             )
#             .set_timeout(30)
#             .build()
#         )
#         # Set the transaction parameters
#         # transaction = (
#         #     TransactionBuilder(
#         #         source_account=receiving_account,
#         #         network_passphrase=Network.TESTNET_NETWORK_PASSPHRASE,  # Change to PUBLIC_NETWORK_PASSPHRASE for mainnet
#         #         base_fee=server.fetch_base_fee(),
#         #     )
#         #     .add_text_memo("Transaction memo")
#         #     .append_payment_op(destination=customer_stellar_account, asset_code="XLM", amount=amount)  # Specify the amount
#         #     .build()
#         # )
#         print("AFETER BUILDER")

#         # Sign and submit the transaction
#         transaction.sign(stellar_keypair)
#         print("SIGNNN")
#         stellar_response = server.submit_transaction(transaction)

#         print("SIGNNN$$#$#$#$#$#$34")

#         return {"status": "success", "transaction_hash": stellar_response["hash"]}

#     except Exception as e:
#         return {"status": "error", "message": str(e)}


# @stellarApp.route('/momo_payment_complete', methods=['POST'])
# def handle_momo_payment():
#     data = request.get_json()
#     amount = data.get("amount")  # Amount received in fiat
#     currency = data.get("currency")  # Currency of the payment (e.g., USD or local currency)

#     #TODO: Get from database
#     customer_stellar_account = data.get("customer_stellar_account")

#     # Convert and transfer USDC to the customer's Stellar account
#     usdc_transfer_response = convert_and_transfer_usdc(amount, currency, customer_stellar_account)

#     print(usdc_transfer_response)

#     if usdc_transfer_response.get("status") == "success":
#         return jsonify({
#             "message": f"Transferred {amount} {currency} (converted to USDC) to {customer_stellar_account}"
#         }), 200
#     else:
#         return jsonify({"error": "Failed to transfer USDC"}), 500


# @stellarApp.route('/create-customer-keypair')
# def generate_key_pair():
#     keypair = Keypair.random()

#     url = "https://friendbot.stellar.org"
#     response = requests.get(url, params={"addr": keypair.public_key})
#     print(response)

#     return{
#         "public_key": keypair.public_key,
#         "secret_key": keypair.secret
#     }

import requests
from dotenv import load_dotenv
import os
from stellar_sdk import Server, Network, TransactionBuilder, Asset, Keypair
from flask import Flask, Blueprint, jsonify, request
from flask_cors import CORS

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app and Blueprint
app = Flask(__name__)
stellarApp = Blueprint('stellarApp', __name__)
CORS(stellarApp)

# Constants for Stellar
STELLAR_TESTNET_SERVER = "https://horizon-testnet.stellar.org"
server = Server(STELLAR_TESTNET_SERVER)

# Account to receive funds from customers
RECEIVING_STELLAR_PUBLIC_KEY = os.getenv("RECEIVING_STELLAR_PUBLIC_KEY")  # Your public key
RECEIVING_STELLAR_SECRET_KEY = os.getenv("RECEIVING_STELLAR_SECRET_KEY")  # Your secret key

# Create Stellar Keypair Object for receiving account
stellar_keypair = Keypair.from_secret(RECEIVING_STELLAR_SECRET_KEY)

# USDC Asset information
# USDC_ISSUER_ACCOUNT = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
# USDC = Asset("USDC", USDC_ISSUER_ACCOUNT)

xlm_asset = Asset.native()  # XLM is the native asset on Stellar

# Function to convert and transfer USDC to the customer's Stellar account
def convert_and_transfer_usdc(amount, currency, customer_stellar_account):
    try:
        print("DEPOSITTTTT")
        print(amount)
        # Load your receiving Stellar account to create the transaction
        receiving_account = server.load_account(RECEIVING_STELLAR_PUBLIC_KEY)

        # Create and sign a transaction to send USDC to the customer
        transaction = (
            TransactionBuilder(
                source_account=receiving_account,
                network_passphrase=Network.TESTNET_NETWORK_PASSPHRASE,
                base_fee=100
            )
            .append_payment_op(
                destination=customer_stellar_account,
                amount=str(round(amount, 2)),  # Amount in USDC
                asset=xlm_asset
            )
            .set_timeout(30)
            .build()
        )

        print("Transaction built")

        # Sign and submit the transaction
        transaction.sign(stellar_keypair)
        stellar_response = server.submit_transaction(transaction)

        return {"status": "success", "transaction_hash": stellar_response["hash"]}

    except Exception as e:
        return {"status": "error", "message": str(e)}

# @stellarApp.route('/momo_payment_complete', methods=['POST'])
def handle_momo_payment(amount, currency, customer_stellar_account):
    # data = request.get_json()
    # amount = data.get("amount")  # Amount received in fiat
    # currency = data.get("currency")
    # # Currency of the payment (e.g., USD or local currency)

    # # Get the customer's Stellar account from the request
    # customer_stellar_account = data.get("customer_stellar_account")


    # Convert and transfer USDC to the customer's Stellar account
    usdc_transfer_response = convert_and_transfer_usdc(amount, currency, customer_stellar_account)

    if usdc_transfer_response.get("status") == "success":
        return jsonify({
            "message": f"Transferred {amount} XLM to {customer_stellar_account}",
            "transaction_hash": usdc_transfer_response["transaction_hash"]
        }), 200
    else:
        return jsonify({"error": usdc_transfer_response.get("message", "Failed to transfer USDC")}), 500

# @stellarApp.route('/create-customer-keypair')
def generate_key_pair():
    keypair = Keypair.random()

    url = "https://friendbot.stellar.org"
    response = requests.get(url, params={"addr": keypair.public_key})
    print(response)

    return {
        "public_key": keypair.public_key,
        "secret_key": keypair.secret
    }

# MoMo API endpoint and authorization
# MOMO_API_URL = os.getenv("MOMO_API_URL")  # e.g., "https://api.momo-provider.com/transfer"
# MOMO_API_KEY = os.getenv("MOMO_API_KEY")  # Your MoMo API authorization key

# function to transfer funds from customer to receing account
def transfer_to_stellar(amount, customer_stellar_account, customer_secret_key):
    try:
        # Load the customer's Stellar account to create the transaction
        customer_account = server.load_account(customer_stellar_account)

        print("WITHDRAWWWW")
        print(amount)

        # Create and sign a transaction to send XLM to the receiving account
        transaction = (
            TransactionBuilder(
                source_account=customer_account,
                network_passphrase=Network.TESTNET_NETWORK_PASSPHRASE,
                base_fee=100
            )
            .append_payment_op(
                destination=RECEIVING_STELLAR_PUBLIC_KEY,
                amount=str(round(amount, 2)),
                asset=xlm_asset
            )
            .set_timeout(30)
            .build()
        )

        # Sign and submit the transaction
        transaction.sign(customer_secret_key)
        stellar_response = server.submit_transaction(transaction)

        return {"status": "success", "transaction_hash": stellar_response["hash"]}

    except Exception as e:
        return {"status": "error", "message": str(e)}

# Withdraw function: directly initiates a withdrawal to the customer's mobile money account
# def withdraw_to_momo(amount, customer_stellar_account, customer_momo_number):
#     try:
#         # Directly initiate MoMo transfer request
#         momo_response = requests.post(
#             MOMO_API_URL,
#             headers={"Authorization": f"Bearer {MOMO_API_KEY}"},
#             json={
#                 "amount": amount,
#                 "currency": "XLM",  # Specify the currency if needed
#                 "recipient_number": customer_momo_number,
#                 "stellar_account": customer_stellar_account
#             }
#         )

#         if momo_response.status_code == 200:
#             return {
#                 "status": "success",
#                 "message": f"{amount} XLM successfully withdrawn to MoMo number {customer_momo_number}.",
#                 "momo_response": momo_response.json()
#             }
#         else:
#             return {
#                 "status": "error",
#                 "message": "Failed to complete MoMo transfer.",
#                 "momo_error": momo_response.text
#             }

#     except Exception as e:
#         return {"status": "error", "message": str(e)}

def get_stellar_balance(public_key):
    account = server.accounts().account_id(public_key).call()
    balances = account['balances']
    for balance in balances:
        if balance['asset_type'] == 'native':
            return balance['balance']

    return 0

@stellarApp.route('/withdraw', methods=['POST'])
def handle_withdraw():
    data = request.get_json()
    amount = data.get("amount")
    customer_stellar_account = data.get("customer_stellar_account")
    customer_momo_number = data.get("customer_momo_number")

    withdraw_response = withdraw_to_momo(amount, customer_stellar_account, customer_momo_number)

    if withdraw_response.get("status") == "success":
        return jsonify(withdraw_response), 200
    else:
        return jsonify({"error": withdraw_response.get("message")}), 500

if __name__ == "__main__":
    app.run(debug=True)
