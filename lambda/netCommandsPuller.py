import json
import boto3
import os
import random
from boto3.dynamodb.conditions import Key
from decimal import Decimal

# Get table name from env or fallback
TABLE_NAME = os.environ.get('TABLE_NAME', 'netCommands')

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(TABLE_NAME)

# Custom JSON encoder to convert Decimals
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            return int(o) if o % 1 == 0 else float(o)
        return super(DecimalEncoder, self).default(o)

def lambda_handler(event, context):
    # CORS headers
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,GET"
    }

    # Handle OPTIONS request for CORS preflight
    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": headers,
            "body": ""
        }

    try:
        # Get parameters from query string
        params = event.get('queryStringParameters', {}) or {}
        question_type = params.get('question-type')
        count = int(params.get('count', 1))  # Default to 1 question

        if not question_type:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Missing required parameter: question-type'})
            }

        # Query the table
        response = table.query(
            KeyConditionExpression=Key('question-type').eq(question_type)
        )
        items = response.get('Items', [])

        if not items:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'No questions found for the specified type'})
            }

        # Randomly select requested number of questions
        selected_items = random.sample(items, min(count, len(items)))

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(selected_items, cls=DecimalEncoder)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }
