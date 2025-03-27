import json
import random
import boto3
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def lambda_handler(event, context):
    # Simple CORS headers that allow all origins
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST",
        "Access-Control-Allow-Credentials": "false"  # Must be false when using "*"
    }

    # Handle OPTIONS request for CORS preflight
    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": headers,
            "body": ""
        }

    # 1) Detect if this is a test event or API Gateway GET request
    if "queryStringParameters" in event:
        body = event["queryStringParameters"] or {}
    else:
        body = event

    mode = body.get("mode", "generator1")
    exam_name = body.get("exam", "A1101")
    count = int(body.get("count", 1))
    filter_domain = body.get("domain")
    filter_difficulty = body.get("difficulty")

    print(f"Processing request with params: exam={exam_name}, domain={filter_domain}, count={count}")

    try:
        table = dynamodb.Table(exam_name)
        response = table.scan()
        items = response.get('Items', [])
        
        print(f"Found {len(items)} items in table {exam_name}")

        # Strict domain filtering (exact match only)
        if filter_domain:
            items = [
                q for q in items 
                if str(q.get("domain", "")).strip() == str(filter_domain).strip()
            ]
            print(f"After domain filtering: {len(items)} items remain")

        # Difficulty filtering
        if filter_difficulty:
            items = [
                q for q in items
                if str(q.get("difficulty", "")).lower() == str(filter_difficulty).lower()
            ]
            print(f"After difficulty filtering: {len(items)} items remain")

        # Shuffle & limit
        random.shuffle(items)
        selected = items[:count]

        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps(selected, default=decimal_default)
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({
                "error": str(e)
            })
        }
