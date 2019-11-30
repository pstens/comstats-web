#!/usr/bin/env python3
import requests
import gzip
import json
import uuid

API_URL = 'https://comdroid.fksrv3.de/de_aleaderboard2.php'
CID_EHRINGHAUSEN = '10240619'
TID_EHRINGHAUSEN = '1611599'


def get_stats(cid, tid):
    uid = uuid.uuid4()
    payload = {"uid": str(uid), "cid": cid, "tid": tid, "live": "on"}
    data = gzip.compress(bytes(json.dumps(payload), 'utf-8'))
    response = requests.post(url=API_URL, data=data)
    print(json.loads(response.text))

get_stats(CID_EHRINGHAUSEN, TID_EHRINGHAUSEN)
