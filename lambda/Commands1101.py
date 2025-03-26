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
        
        # Get question type from query parameters, default to command_to_description
        question_type = event.get('queryStringParameters', {}).get('type', 'command_to_description')
        print(f"Querying for question type: {question_type}")
        
        # Query items with the specified question-type
        response = table.query(
            KeyConditionExpression=Key('question-type').eq(question_type)
        )
        
        if not response['Items']:
            return {
                'statusCode': 404,
                'body': json.dumps('No questions found for the specified type')
            }
            
        # Randomly select one question from the results
        selected_question = random.choice(response['Items'])
        
        # Ensure consistent formatting
        formatted_question = {
            'question-text': selected_question['question-text'],
            'option-a': selected_question['option-a'],
            'option-b': selected_question['option-b'],
            'option-c': selected_question['option-c'],
            'option-d': selected_question['option-d'],
            'explanation-a': selected_question['explanation-a'],
            'explanation-b': selected_question['explanation-b'],
            'explanation-c': selected_question['explanation-c'],
            'explanation-d': selected_question['explanation-d'],
            'correct answer': selected_question['correct answer'],
            'question-type': selected_question['question-type'],
            'question-id': selected_question.get('question-id', 0)
        }
        
        # Print the formatted question for debugging
        print(f"Returning formatted question: {json.dumps(formatted_question, cls=DecimalEncoder)}")
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps([formatted_question], cls=DecimalEncoder)
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
