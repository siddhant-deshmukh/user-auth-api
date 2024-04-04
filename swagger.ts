const swaggerJsdoc = require('swagger-jsdoc');


const options = {
  definition: {
    openapi: '3.0.0', // API specification version
    info: {
      title: 'User Management API',
      version: '1.0.0', // Version of your API
      description: 'API for creating, viewing, updating, and deleting users',
    },
    servers: [
      { url: 'http://localhost:5000' }, // Change to your server URL if needed
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          in: 'header',
          description: 'JWT token required for authorization', // Add description
        },
      },
    },
    // securitySchemes: {
    //   bearerAuth: {
    //     type: 'http',
    //     scheme: 'bearer',
    //     bearerFormat: 'JWT',
    //     name: 'Authorization',
    //     in: 'header',
    //     description: 'JWT token required for authorization', // Add description
    //   },
    // },
    schemes: ['http', 'https'],
    
    // security: [

    //   {
    //     bearerAuth: []
    //   }
    // ]
  },
  apis: ['./models/*.ts', './routes/*.ts'], // Adjust paths to your models and routes
};

export const specs = swaggerJsdoc(options);
// console.log(specs)