import json
import os
import boto3
import random
from boto3.dynamodb.conditions import Attr
from decimal import Decimal

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def get_filtered_questions(exam, count=30):
    """
    Fetch questions from the appropriate DynamoDB table based on exam type
    """
    table = dynamodb.Table(exam)  # e.g., 'A1101', 'Net', etc.
    
    try:
        # Scan the table for all questions
        response = table.scan()
        items = response.get('Items', [])
        
        # Validate each question has required fields
        required_fields = [
            'question-text', 
            'option-a', 
            'option-b', 
            'option-c', 
            'option-d',
            'correct answer',
            'explanation-a',
            'explanation-b',
            'explanation-c',
            'explanation-d'
        ]
        
        valid_questions = [
            item for item in items 
            if all(field in item for field in required_fields)
        ]
        
        if not valid_questions:
            raise ValueError(f"No valid questions found in table {exam}")
        
        # Randomly select the requested number of questions
        selected_questions = random.sample(
            valid_questions, 
            min(count, len(valid_questions))
        )
        
        return selected_questions
        
    except Exception as e:
        print(f"Error fetching questions from DynamoDB: {str(e)}")
        raise

def lambda_handler(event, context):
    # Define allowed origins
    allowed_origins = ['http://localhost:5173', 'https://thecomptiabible.com']
    
    # Get the origin from the request headers
    origin = event.get('headers', {}).get('origin', '')
    
    # Set CORS headers
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Headers": "Content-Type,X-Api-Key,x-api-key,Origin",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
        "Access-Control-Allow-Credentials": "false"
    }
    
    # Set Allow-Origin if origin is in allowed list
    if origin in allowed_origins:
        headers["Access-Control-Allow-Origin"] = origin

    # Handle OPTIONS request (preflight)
    if event.get("httpMethod") == "OPTIONS":
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'message': 'CORS enabled'})
        }

    try:
        # Get query parameters
        query_params = event.get('queryStringParameters', {})
        exam = query_params.get('exam')
        count = int(query_params.get('count', 30))  # Default to 30 questions

        if not exam:
            raise ValueError("Exam parameter is required")

        # Get questions from DynamoDB
        questions = get_filtered_questions(exam, count)

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(questions, default=decimal_default)
        }

    except Exception as e:
        print(f"Error in lambda_handler: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'error': str(e)
            })
        }
