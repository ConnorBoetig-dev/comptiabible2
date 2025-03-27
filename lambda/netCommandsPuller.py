import json
import boto3
import os
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
    try:
        question_type = event['queryStringParameters']['question-type']
    except (TypeError, KeyError):
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing or invalid query parameter: question-type'})
        }

    try:
        response = table.query(
            KeyConditionExpression=Key('question-type').eq(question_type)
        )
        items = response.get('Items', [])

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps(items, cls=DecimalEncoder)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
