const NotFoundError = require('../CustomErrors/SystemError')
const dbPool = require('../config/dbPool')
const Payment = require('../models/Payment')

const getAllPayments = async () => {
    let connection = null

    try {
        connection = await dbPool.getConnection()

        const sql = "SELECT * FROM payments"
        const [rows] = await connection.execute(sql)

        // Verificar se alguma transação foi encontrada
        if (rows.length === 0) {
            throw new NotFoundError('Nenhum pagamento encontrada')
        }

        return rows.map(row => new Payment(
            row.id,
            row.customer_id,
            row.event_id,
            row.asaas_id,
            row.value,
            row.billing_type,
            row.transaction_date,
            row.due_date,
            row.description,
            row.status,
            row.invoice_url,
            row.created_at
        ))

    } catch (error) {
        console.log(error)
        if (error instanceof NotFoundError) {
            throw error
        }
        throw new Error("Erro ao consultar pagamentos")
    } finally {
        if (connection) {
            connection.release()
        }
    }

}

const createPayment = async (payment) => {
    let connection = null
    try {
        connection = await dbPool.getConnection()

        // Insert the payment into the database
        const sqlInsert = `
            INSERT INTO payments (
                customer_id, event_id, asaas_id, value, billing_type, transaction_date, due_date, description, status, invoice_url
            ) VALUES (?, ?, ?, ?, ?, now(), now() + INTERVAL 30 DAY, ?, ?, ?)`
        const [insertResult] = await connection.execute(sqlInsert, [
            payment.customerId,
            payment.eventId,
            payment.asaasId,
            payment.value,
            payment.billingType,
            payment.description,
            payment.status,
            payment.invoiceUrl
        ])

        // Retrieve the newly created payment row using the last insert id
        const newPaymentId = insertResult.insertId
        const sqlSelect = 'SELECT * FROM payments WHERE id = ?'
        const [rows] = await connection.execute(sqlSelect, [newPaymentId])

        if (rows.length > 0) {
            return rows[0]  // Retorna o pagamento criado
        } else {
            throw new Error('Erro ao recuperar o pagamento criado')
        }
    } catch (error) {
        console.log(error)
        throw new Error('Erro ao cadastrar pagamento')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}


module.exports = {
    getAllPayments,
    createPayment
}