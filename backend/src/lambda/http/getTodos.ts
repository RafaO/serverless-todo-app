import 'source-map-support/register'

import { createLogger } from '../../utils/logger'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getAllTodos } from '../../businessLogic/todos'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getUserId } from '../utils'

const logger = createLogger('getTodos')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Getting all todos', event.body)

  const userId: string = getUserId(event)
  const todos = await getAllTodos(userId)

  return {
    statusCode: 200,
    body: JSON.stringify({
      items: todos
    })
  }
})

handler.use(cors())
