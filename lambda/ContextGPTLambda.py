import json
import os
import requests

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
            'body': json.dumps({'message': 'CORS preflight success'})
        }

    try:
        # API key verification with debug logging
        request_api_key = event.get('headers', {}).get('x-api-key')
        expected_api_key = os.environ.get('API_GATEWAY_KEY')
        
        print("Request API Key present:", bool(request_api_key))
        print("Expected API Key present:", bool(expected_api_key))
        
        if not request_api_key or request_api_key != expected_api_key:
            print("API Key verification failed")
            return {
                'statusCode': 403,
                'headers': headers,
                'body': json.dumps({
                    'error': 'Unauthorized',
                    'debug': {
                        'hasRequestKey': bool(request_api_key),
                        'hasExpectedKey': bool(expected_api_key)
                    }
                })
            }

        if not event.get('body'):
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'No body provided'})
            }

        body = json.loads(event['body'])
        question_context = body.get('questionContext', {})
        chat_history = body.get('chatHistory', [])
        user_message = body.get('userMessage', '')

        messages = [
            {
                "role": "system",
                "content": f"You are a helpful AI tutor. Use the following question context to help the user understand the topic better: "
                           f"Question: {question_context.get('question_text')}\n"
                           f"Options:\nA) {question_context.get('option_a')}\n"
                           f"B) {question_context.get('option_b')}\n"
                           f"C) {question_context.get('option_c')}\n"
                           f"D) {question_context.get('option_d')}\n"
                           f"User selected: {question_context.get('selected_answer')}\n"
                           f"Correct answer: {question_context.get('correct_answer')}"
            }
        ]
        messages.extend(chat_history)
        messages.append({
            "role": "user",
            "content": user_message
        })

        openai_response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {os.environ.get('OPENAI_API_KEY')}",
                "Content-Type": "application/json"
            },
            json={
                "model": "gpt-3.5-turbo",
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 150
            }
        )

        if not openai_response.ok:
            return {
                'statusCode': openai_response.status_code,
                'headers': headers,
                'body': json.dumps({'error': f'OpenAI API error: {openai_response.text}'})
            }

        response_data = openai_response.json()
        ai_response = response_data['choices'][0]['message']['content']

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'response': ai_response})
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }

