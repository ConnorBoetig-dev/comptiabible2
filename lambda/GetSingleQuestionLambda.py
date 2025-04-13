import json
import os
import urllib3

def lambda_handler(event, context):
    # Debug logging for incoming request
    print("Incoming event:", json.dumps(event, indent=2))
    
    # Define allowed origins
    allowed_origins = ['http://localhost:5173', 'https://thecomptiabible.com']
    
    # Get the origin from the request headers
    origin = event.get('headers', {}).get('origin', '')
    print("Received Origin:", origin)
    
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
        # API key verification
        request_api_key = event.get('headers', {}).get('x-api-key')
        if not request_api_key:
            request_api_key = event.get('headers', {}).get('X-Api-Key')
        
        expected_api_key = os.environ.get('API_GATEWAY_KEY')
        
        if not request_api_key or request_api_key != expected_api_key:
            return {
                'statusCode': 403,
                'headers': headers,
                'body': json.dumps({
                    'error': 'Unauthorized - Invalid or missing API key'
                })
            }

        # Handle different HTTP methods
        if event.get("httpMethod") == "GET":
            # Get parameters from query string
            params = event.get("queryStringParameters", {})
            question_context = {
                'exam': params.get('exam'),
                'domain': params.get('domain'),
                'count': params.get('count')
            }
        else:  # POST
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

        # Process the request based on method
        if event.get("httpMethod") == "GET":
            # Handle GET request (question generation)
            question_data = [{
                'question-text': 'Your question text here',
                'option-a': 'Option A',
                'option-b': 'Option B',
                'option-c': 'Option C',
                'option-d': 'Option D',
                'correct answer': 'A',
                # Add any other required fields
            }]

            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(question_data)  # Make sure it's an array
            }
        else:
            # Handle POST request (chat functionality)
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

            http = urllib3.PoolManager()
            openai_response = http.request(
                'POST',
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {os.environ.get('OPENAI_API_KEY')}",
                    "Content-Type": "application/json"
                },
                body=json.dumps({
                    "model": "gpt-3.5-turbo",
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 150
                })
            )

            if openai_response.status != 200:
                return {
                    'statusCode': openai_response.status,
                    'headers': headers,
                    'body': json.dumps({'error': f'OpenAI API error: {openai_response.data.decode("utf-8")}'})
                }

            response_data = json.loads(openai_response.data.decode('utf-8'))
            ai_response = response_data['choices'][0]['message']['content']
            response_data = {'response': ai_response}

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(response_data)
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }
