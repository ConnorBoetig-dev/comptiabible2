import json
import boto3
import os
import random
from boto3.dynamodb.conditions import Key
from decimal import Decimal

# Use environment variable or default to 'netCommands'
TABLE_NAME = os.environ.get('TABLE_NAME', 'netCommands')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(TABLE_NAME)

# JSON encoder to handle Decimal values from DynamoDB
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            return int(o) if o % 1 == 0 else float(o)
        return super().default(o)

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

    try:
        # Get query parameters
        params = event.get('queryStringParameters') or {}
        question_type = params.get('question-type')
        count = int(params.get('count', 1))

        if not question_type:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Missing required parameter: question-type'})
            }

        # Query DynamoDB
        response = table.query(
            KeyConditionExpression=Key('question-type').eq(question_type)
        )
        items = response.get('Items', [])

        if not items:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'No questions found for this type'})
            }

        selected = random.sample(items, min(count, len(items)))

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(selected, cls=DecimalEncoder)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }
