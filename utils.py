import os
import random
import string

import requests
import jwt


ENVIRONMENT = os.getenv('ENVIRONMENT', 'sandbox')
CLIENT_ID_CALM = os.environ['CALM_CLIENT_ID']
CLIENT_SECRET_CALM = os.environ['CALM_CLIENT_SECRET']
auth_api = "https://auth.verygoodsecurity.com/auth/realms/vgs/protocol/openid-connect/token"
calm_api = f"https://calm.{ENVIRONMENT}.verygoodsecurity.app"


jwt_cached = None


def provide_jwt():
    global jwt_cached
    if not is_jwt_valid(jwt_cached):
        jwt_cached = fetch_jwt()
    return jwt_cached


def is_jwt_valid(token):
    if token is None:
        return False
    try:
        jwt.decode(token, 'secret', algorithms='RS256',
                   options={'verify_signature': False, 'verify_aud': False, 'verify_exp': True})
    except (jwt.DecodeError, jwt.ExpiredSignatureError):
        return False
    return True


def fetch_jwt():
    payload = {
        'client_id': f'{CLIENT_ID_CALM}',
        'client_secret': f'{CLIENT_SECRET_CALM}',
        'grant_type': 'client_credentials'
    }
    response = requests.post(auth_api, data=payload)
    return response.json()['access_token']


def request_data(name, number, exp_month, exp_year):
    return {
        "name": name,
        "number": number,
        "exp_month": int(exp_month),
        "exp_year": int(exp_year),
        "capabilities": [
            "ACCOUNT_UPDATER"
        ]
    }


def post_card_calm(name, number, exp_month, exp_year):
    json = request_data(name, number, exp_month, exp_year)
    response = requests.post("{}/cards".format(calm_api),
                             json=json,
                             headers={
                                 'Content-Type': 'application/json',
                                 'Authorization': f'Bearer {fetch_jwt()}'
                             },
                             )
    return response


def get_card_calm(response, headers):
    if "data" in response:
        card_id = response["data"]["id"]
        response = requests.get("{}/cards/{}".format(calm_api, card_id),
                                headers=headers)
        return response
