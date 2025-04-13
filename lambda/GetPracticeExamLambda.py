import json
import os

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

        # Your logic to generate practice exam questions here
        # This is a placeholder - replace with your actual question generation logic
        questions = generate_practice_exam_questions(exam, count)

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(questions)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'error': str(e)
            })
        }

def generate_practice_exam_questions(exam, count):
    # Implement your question generation logic here
    # This is just a sample structure
    questions = []
    for i in range(count):
        question = {
            'question-text': f'Sample question {i + 1} for exam {exam}',
            'option-a': 'Option A',
            'option-b': 'Option B',
            'option-c': 'Option C',
            'option-d': 'Option D',
            'correct answer': 'A',
            'explanation-a': 'Explanation for option A',
            'explanation-b': 'Explanation for option B',
            'explanation-c': 'Explanation for option C',
            'explanation-d': 'Explanation for option D'
        }
        questions.append(question)
    return questions