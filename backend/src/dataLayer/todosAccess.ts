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
        private readonly userIdIndex = process.env.USER_ID_INDEX,
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly bucketName = process.env.IMAGES_S3_BUCKET) {
    }

    async getAllTodos(userId: string): Promise<TodoItem[]> {
        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.userIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
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

    async updateTodo(userId: string, todoId: string, todo: UpdateTodoRequest): Promise<TodoItem> {
        const { name, dueDate, done } = todo
        const newValue = await this.docClient.update({
            TableName: this.todosTable,
            Key: { todoId, userId },
            UpdateExpression: 'set #todoName=:name, dueDate=:dueDate, done=:done',
            ExpressionAttributeNames: { '#todoName': 'name' },
            ExpressionAttributeValues: {
                ':name': name,
                ':dueDate': dueDate,
                ':done': done
            },
            ReturnValues: "ALL_NEW"
        }).promise()

        logger.log('info', 'todo updated')

        return newValue.Attributes as TodoItem
    }

    async createImage(userId: string, todoId: string) {
        await this.docClient.update({
            TableName: this.todosTable,
            Key: { userId, todoId },
            UpdateExpression: 'set attachmentUrl=:attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
            }
        }).promise()
    }

    async deleteTodo(userId: string, todoId: string): Promise<TodoItem> {
        const deletedItem = await this.docClient.delete({
            TableName: this.todosTable,
            Key: { todoId, userId },
            ReturnValues: "ALL_OLD"
        }).promise()

        return deletedItem.Attributes as TodoItem
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
