import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk');
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { createLogger } from '../utils/logger';

const logger = createLogger('todoAccess')

export class TodoAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE) {
    }

    async getAllTodos(): Promise<TodoItem[]> {
        const result = await this.docClient.scan({
            TableName: this.todosTable
        }).promise()

        const items = result.Items
        return items as TodoItem[]
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()

        return todo
    }

    async updateTodo(todoId: string, todo: UpdateTodoRequest): Promise<TodoItem> {
        const queryResult = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'todoId = :todoId',
            ExpressionAttributeValues: { ':todoId': todoId }
        }).promise()

        logger.log('todo found', queryResult.Items[0].name)

        const { name, dueDate, done } = todo
        const newValue = await this.docClient.update({
            TableName: this.todosTable,
            Key: { todoId, createdAt: queryResult.Items[0].createdAt },
            UpdateExpression: 'set #todoName=:name, dueDate=:dueDate, done=:done',
            ExpressionAttributeNames: { '#todoName': 'name' },
            ExpressionAttributeValues: {
                ':name': name,
                ':dueDate': dueDate,
                ':done': done
            },
            ReturnValues: "ALL_NEW"
        }).promise()

        return newValue.Attributes as TodoItem
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        console.log('Creating a local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient()
}
