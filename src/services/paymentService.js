const { v4: uuidv4 } = require('uuid');

const NotFoundError = require('../CustomErrors/NotFoundError')
const dbPool = require('../config/dbPool')
const Payment = require('../models/Payment')
const Refund = require('../models/Refund')

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

        const payments = rows.map(row => new Payment(
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

        return { payments }

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

const getPayment = async (id) => {
    let connection = null

    try {
        connection = await dbPool.getConnection()

        const sql = "SELECT * FROM payments WHERE id = ?"
        const [rows] = await connection.execute(sql, [id])

        // Verificar se alguma transação foi encontrada
        if (rows.length === 0) {
            throw new NotFoundError('Nenhum pagamento encontrada')
        }

        const row = rows[0]
        const payment = new Payment(
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
        )

        return { payment }

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

const createPayment = async (newPayment) => {
    let connection = null
    try {
        connection = await dbPool.getConnection()

        newPayment.id = "pay_" + uuidv4()

        const sqlInsert = `
            INSERT INTO payments (
                id, customer_id, event_id, asaas_id, value, billing_type, transaction_date, due_date, description, status, invoice_url
            ) VALUES (?, ?, ?, ?, ?, ?, now(), now() + INTERVAL 30 DAY, ?, ?, ?)`
        await connection.execute(sqlInsert, [
            newPayment.id,
            newPayment.customerId,
            newPayment.eventId,
            newPayment.asaasId,
            newPayment.value,
            newPayment.billingType,
            newPayment.description,
            newPayment.status,
            newPayment.invoiceUrl
        ])

        // Retrieve the newly created payment row using the last insert id
        const sqlSelect = 'SELECT * FROM payments WHERE id = ?'
        const [rows] = await connection.execute(sqlSelect, [newPayment.id])

        if (rows.length === 0) {
            throw new NotFoundError('Erro ao recuperar o pagamento cadastrado')
        }

        const row = rows[0]
        const payment = new Payment(
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
        )

        return { payment }

    } catch (error) {
        console.log(error)
        if (error instanceof NotFoundError) {
            throw error
        }
        throw new Error('Erro ao cadastrar pagamento')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

const refundPayment = async (newRefund) => {
    let connection = null

    try {
        connection = await dbPool.getConnection()

        newRefund.id = "ref_" + uuidv4()

        // Inserindo estorno na tabela
        const sqlInsert = 'INSERT INTO refunds (id, payment_id, status, value, refund_date) VALUES (?, ?, ?, ?, ?)'
        await connection.execute(sqlInsert, [
            newRefund.id,
            newRefund.paymentId,
            newRefund.status,
            newRefund.value,
            newRefund.refundDate
        ])

        const sqlSelect = 'SELECT * FROM refunds WHERE id = ?'
        const [rows] = await connection.execute(sqlSelect, [newRefund.id])

        // Verificando o estorno recuperado
        if (rows.length === 0) {
            throw new NotFoundError('Erro ao recuperar o estorno cadastrado')
        }

        const row = rows[0]
        const refund = new Refund(
            row.id,
            row.payment_id,
            row.status,
            row.value,
            row.refund_date,
            row.created_at
        )

        return { refund }

    } catch (error) {
        console.log(error);
        if (error instanceof NotFoundError) {
            throw error;
        }
        throw new Error('Erro ao cadastrar estorno')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}


const changePaymentStatus = async (payment) => {

    let connection = null

    try {
        connection = dbPool.getConnection()

        const sqlUpdate = 'UPDATE payments SET status = ? WHERE id = ?'
        const [ResultSetHeader] = await connection.execute(sqlUpdate, [payment.status, payment.id])

        if (ResultSetHeader.changedRows === 0) {
            if (ResultSetHeader.affectedRows === 1) {
                throw new NoContentError('Pagamento atualizado sem alterações')
            }
            throw new NotFoundError('Pagamento não encontrado')
        }

        const sqlSelect = 'SELECT * FROM payments WHERE id = ?'
        const [rows] = await connection.execute(sqlSelect, [payment.id])

        // Verificando se o pagamento foi retornado
        if (rows.length === 0) {
            throw new NotFoundError('Erro ao recuperar o pagamento atualizado')
        }

        const row = rows[0]
        const payment = new Payment(
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
        )

        return { payment }

    } catch (error) {
        console.log(error)
        if (error instanceof NotFoundError) {
            throw error
        }
        throw new Error('Erro ao atualizar o status do pagamento')
    } finally {
        if (connection) {
            connection.refresh()
        }
    }
}


module.exports = {
    getAllPayments,
    getPayment,
    createPayment,
    refundPayment,
    changePaymentStatus
}