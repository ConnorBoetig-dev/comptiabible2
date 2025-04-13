import json
import random
import boto3
from decimal import Decimal
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('ports')

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def lambda_handler(event, context):
    # Define allowed origins
    allowed_origins = ['http://localhost:5173', 'https://thecomptiabible.com']
    
    # Get the origin from the request headers
    origin = event.get('headers', {}).get('origin', '')
    
    # Set CORS headers
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Headers": "Content-Type,X-Api-Key,x-api-key,Origin,Authorization",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Origin": origin if origin in allowed_origins else allowed_origins[0],
        "Access-Control-Allow-Credentials": "true"
    }
    
    # Handle OPTIONS request (preflight)
    if event.get("httpMethod") == "OPTIONS":
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'message': 'Preflight successful'})
        }

    try:
        # Get parameters from either query string or body
        if "queryStringParameters" in event and event["queryStringParameters"]:
            params = event["queryStringParameters"]
        elif "body" in event and event["body"]:
            params = json.loads(event["body"]) if isinstance(event["body"], str) else event["body"]
        else:
            params = {}

        question_type = params.get("questionType", "identify_protocol_from_number")

        response = table.query(
            KeyConditionExpression=Key('question-type').eq(question_type)
        )

        items = response.get('Items', [])
        
        if not items:
            return {
                "statusCode": 404,
                "headers": headers,
                "body": json.dumps({"error": "No items found for this question type"})
            }

        required_fields = [
            'question-text', 
            'correct answer',
            'option-a',
            'explanation-a',
            'option-b',
            'explanation-b',
            'option-c',
            'explanation-c',
            'option-d',
            'explanation-d'
        ]
        
        valid_items = [
            item for item in items 
            if all(key in item for key in required_fields)
        ]

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
