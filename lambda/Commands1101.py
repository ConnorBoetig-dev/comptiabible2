import json
import random
import boto3
from boto3.dynamodb.conditions import Key
from decimal import Decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Commands')

    try:
        print("Attempting to query DynamoDB table 'Commands'")
        
        # Query items with question-type 'command_to_description'
        response = table.query(
            KeyConditionExpression=Key('question-type').eq('command_to_description')
        )
        
        print(f"DynamoDB Response: {json.dumps(response, default=str)}")
        
        items = response.get('Items', [])
        print(f"Found {len(items)} items")

        if not items:
            print("No items found in the table matching question-type='command_to_description'")
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'No questions found'})
            }

        # Randomly select one question
        selected_question = random.choice(items)
        print(f"Selected question: {json.dumps(selected_question, default=str)}")

        # Add the explanation for the correct answer to match frontend expectations
        correct_letter = selected_question['correct answer'].lower()
        selected_question['explanation'] = selected_question[f'explanation-{correct_letter}']

        # Return as a single-item array to match frontend expectations
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps([selected_question], cls=DecimalEncoder)
        }

    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }
