import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { generateUploadUrl } from '../../businessLogic/todos'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

const logger = createLogger('generateUploadUrl')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('generating upload url', event.body)

  const todoId = event.pathParameters.todoId

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id

  const uploadUrl = await generateUploadUrl(todoId)

  return {
    statusCode: 200,
    body: JSON.stringify({ uploadUrl })
  }
})

handler.use(cors())
