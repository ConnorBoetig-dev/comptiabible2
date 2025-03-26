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
        params = json.loads(event["body"])
    else:
        params = event

    question_type = params.get("questionType", "identify_protocol_from_number")
    count = 1

    print(f"Fetching questions from 'ports' where question-type = {question_type}")

    try:
        response = table.query(
            KeyConditionExpression=Key('question-type').eq(question_type)
        )

        items = response.get('Items', [])
        print(f"Found {len(items)} items before validation")
        
        if len(items) == 0:
            return {
                "statusCode": 404,
                "headers": headers,
                "body": json.dumps({"error": "No items found for this question type"})
            }

        # Print the first item to see its structure
        if items:
            print("First item structure:", json.dumps(items[0], default=str))

        required_fields = [
            'question-text', 
            'correct answer',  # Changed from 'correct-answer' to match DB
            'option-a',
            'explanation-a',  # Added explanation fields
            'option-b',
            'explanation-b',
            'option-c',
            'explanation-c',
            'option-d',
            'explanation-d'
        ]

        # Check which fields are missing
        for item in items:
            missing_fields = [field for field in required_fields if field not in item]
            if missing_fields:
                print(f"Item missing fields: {missing_fields}")
        
        valid_items = [
            item for item in items 
            if all(key in item for key in required_fields)
        ]

        print(f"Found {len(valid_items)} valid items after validation")

        if not valid_items:
            return {
                "statusCode": 404,
                "headers": headers,
                "body": json.dumps({
                    "error": "No valid questions found for this type",
                    "details": "Items exist but are missing required fields"
                })
            }

        random.shuffle(valid_items)
        selected = valid_items[:1]

        # Add the explanation for the correct answer to match frontend expectations
        for item in selected:
            correct_letter = item['correct answer'].lower()
            item['explanation'] = item[f'explanation-{correct_letter}']

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
