import json
import random
import boto3
from decimal import Decimal
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('ports')  # "ports" table

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def lambda_handler(event, context):
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
    }

    # Handle CORS preflight
    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": headers,
            "body": ""
        }

    # Determine where parameters are coming from
    if "queryStringParameters" in event:
        params = event["queryStringParameters"] or {}
    elif "body" in event and isinstance(event["body"], str):
        # If the body is JSON, parse it
        params = json.loads(event["body"])
    else:
        # Could be a direct test in Lambda console
        params = event

    # Default query params
    question_type = params.get("questionType", "identify_protocol_from_number")
    count = 1  # Remove the count parameter since we'll always want 1

    print(f"Fetching questions from 'ports' where question-type = {question_type}")

    try:
        # Query the table on partition key = "question-type"
        response = table.query(
            KeyConditionExpression=Key('question-type').eq(question_type)
        )

        items = response.get('Items', [])
        random.shuffle(items)
        selected = items[:1]  # Always take just 1 question

        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps(selected, default=decimal_default)
        }

    except Exception as e:
        print(f"Error: {e}")
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"error": str(e)})
        }
