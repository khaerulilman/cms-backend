import prisma from '../prisma/client.js';

export const apiKeyMiddleware = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key is required',
      });
    }

    // Find API key record
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { apiKey: apiKey },
      include: {
        user: true,
      },
    });

    if (!apiKeyRecord || !apiKeyRecord.user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key',
      });
    }

    // Attach user info to request
    req.user = {
      id: apiKeyRecord.user.id,
      email: apiKeyRecord.user.email,
    };

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'API key validation failed',
    });
  }
};

export default apiKeyMiddleware;
