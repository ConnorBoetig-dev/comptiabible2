import json
import boto3
import random
from decimal import Decimal
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')

# Define available certification tables
CERT_TABLES = {
    'A1101': 'A1101',
    'A1102': 'A1102',
    'Net09': 'Net09',
    'Sec701': 'Sec701'
}

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def get_random_questions_from_table(table_name, count):
    """Get random questions from a specific table"""
    table = dynamodb.Table(table_name)
    response = table.scan()
    items = response.get('Items', [])
    
    while 'LastEvaluatedKey' in response:
        response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
        items.extend(response.get('Items', []))
    
    return random.sample(items, min(count, len(items)))

def lambda_handler(event, context):
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://thecomptiabible.com",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,Origin",
        "Access-Control-Allow-Methods": "OPTIONS,GET",
        "Access-Control-Allow-Credentials": "true"
    }

    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": headers,
            "body": ""
        }

    try:
        # Get selected exam from query parameters
        params = event.get('queryStringParameters', {})
        selected_exam = params.get('exam')
        
        if not selected_exam or selected_exam not in CERT_TABLES:
            return {
                "statusCode": 400,
                "headers": headers,
                "body": json.dumps({"error": "Invalid or missing exam selection"})
            }

        # Get 10 random questions from the selected table
        questions = get_random_questions_from_table(CERT_TABLES[selected_exam], 10)
        
        # Add source exam info to each question
        for q in questions:
            q['source_exam'] = selected_exam
        
        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps(questions, default=decimal_default)
        }

    except Exception as e:
        print(f"Error: {e}")
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"error": str(e)})
        }






