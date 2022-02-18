import re

from flask_cors import CORS
from flask import Flask, render_template, request, jsonify, redirect

from utils import fetch_jwt, get_card_calm, post_card_calm

app = Flask(__name__)
CORS(app)


@app.route("/", methods=['GET'])
def account_updater_render():
    return render_template('account_updater.html')


@app.route("/", methods=['POST'])
def account_updater():
    json = request.json
    json['number'] = ''.join(json['number'].split())
    dates = re.findall("\d{2}", json['card-expiration-date'])
    json['exp_month'] = int(dates[0])
    json['exp_year'] = int(dates[1])
    del json['card-expiration-date']

    access_token = fetch_jwt()
    headers = {
        "Content-Type": request.headers["Content-Type"],
        "Authorization": "Bearer {}".format(access_token),
    }

    response = post_card_calm(json['name'], json['number'], json['exp_month'], json['exp_year'])
    if response.ok:
        del headers["Content-Type"]
        response = get_card_calm(response.json(), headers)

    response_json = response.json()
    response_json["token"] = json["number"]
    return jsonify(response_json), response.status_code
