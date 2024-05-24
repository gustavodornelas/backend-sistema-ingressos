const UnauthorizedError = require('../CustomErrors/UnauthorizedError');
const dbPool = require('../config/dbPool')

const tokenVerify = async (req, res, next) => {
    console.log('testando token')
    let connection = null
    try {

        connection = await dbPool.getConnection()

        const token = req.headers.authorization

        console.log (req.headers)

        if (!token) {
            throw new UnauthorizedError('Token não fornecido')
        }
    
        // Verificar se o token está presente no banco de dados
        const sql = 'SELECT * FROM tokens WHERE token = ?'
        const [ rows ] = await connection.execute(sql, [token])

        if ( rows.length === 0 ) {
            throw new UnauthorizedError('Token não encontrado no banco de dados')
        }

        next();

    } catch (error) {
        console.error(error)
        if (error instanceof UnauthorizedError) {
            return res.status(401).json({ error: 'Unauthorized', message: error.message });
        }
        return res.status(500).json({ error: 'Internal Server Error', message: 'Erro ao verificar token de usuário' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

module.exports = tokenVerify;
