import base64
import requests

class MomoApi:
  def __init__(self, base_url, subscription_key):
    self.base_url = base_url
    self.headers = {
      'Ocp-Apim-Subscription-Key': subscription_key,
    }

  def create_api_user(self, uuid):
    url = self.base_url + '/apiuser'

    headers = self.headers
    headers['X-Reference-Id'] = uuid

    data = {
      'providerCallbackHost': 'http://localhost:5000/',
    }

    response = requests.post(url, headers=headers, json=data)
    return response.status_code

  def create_api_key(self, uuid):
    url = f'{self.base_url}/apiuser/{uuid}/apikey'

    headers = self.headers

    response = requests.post(url, headers=headers)

    return response.json()['apiKey']
    return response.status_code, response.json()


class MomoApiUser:
  def __init__(self, base_url, subscription_key, uuid, api_key):
    self.base_url = base_url
    self.headers = {
      'Ocp-Apim-Subscription-Key': subscription_key,
    }
    self.uuid = uuid
    self.api_key = api_key
    self.access_token = None

  def create_token(self):
    url = f'{self.base_url}/collection/token/'
    print(url)

    userid_and_apiKey = self.uuid + ':' + self.api_key
    encoded = base64.b64encode(userid_and_apiKey.encode('utf-8')) 

    headers = self.headers
    headers['Authorization'] = b'Basic ' + encoded
    print(encoded)

    response = requests.post(url, headers=headers)
    print(response.json())

    self.access_token = response.json()['access_token']

    return response.status_code, response.json()

  # to depsit money to the wallet
  def create_request_to_pay(self, amount, currency, external_id, payer_message, payee_note, payer_number):
    url = f'{self.base_url}/collection/v1_0/requesttopay'

    headers = self.headers
    headers['X-Reference-Id'] = external_id
    headers['X-Target-Environment'] = 'sandbox'
    headers['Authorization'] = f'Bearer {self.access_token}'
    headers['Content-Type'] = 'application/json'

    data = {
      'amount': amount,
      'currency': currency,
      'externalId': external_id,
      'payer': {
        'partyIdType': 'MSISDN',
        'partyId': payer_number
      },
      'payerMessage': payer_message,
      'payeeNote': payee_note
    }

    response = requests.post(url, headers=headers, json=data)
    print(response.status_code)

    return response.status_code, response.json()

  # to check the status of the transaction (might not need to be used)
  def get_transaction_status(self, external_id):
    url = f'{self.base_url}/collection/v1_0/requesttopay/{external_id}'
    headers = self.headers
    headers['Authorization'] = f'Bearer {self.access_token}'
    response = requests.get(url, headers=headers)


  def withdraw(self, amount, currency, external_id, payer_message, payee_note, payee_number):
    url = f'{self.base_url}/disbursement/v1_0/transfer'

    headers = self.headers
    headers['X-Reference-Id'] = external_id
    headers['X-Target-Environment'] = 'sandbox'
    headers['Authorization'] = f'Bearer {self.access_token}'
    headers['Content-Type'] = 'application/json'

    data = {
      'amount': amount,
      'currency': currency,
      'externalId': external_id,
      'payee': {
        'partyIdType': 'MSISDN',
        'partyId': payee_number
      },
      'payerMessage': payer_message,
      'payeeNote': payee_note
    }

    response = requests.post(url, headers=headers, json=data)

    return response.status_code, response.json()

  # def get_withdrawal_status(self, external_id):

  def get_balance(self):
    url = f'{self.base_url}/collection/v1_0/account/balance'
    headers = self.headers
    headers['Authorization'] = f'Bearer {self.access_token}'
    headers['X-Target-Environment'] = 'sandbox'
    response = requests.get(url, headers=headers)

    return response.status_code, response.json()

