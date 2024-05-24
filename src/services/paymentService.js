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

        return new Payment(
            rows[0].id,
            rows[0].customer_id,
            rows[0].event_id,
            rows[0].asaas_id,
            rows[0].value,
            rows[0].billing_type,
            rows[0].transaction_date,
            rows[0].due_date,
            rows[0].description,
            rows[0].status,
            rows[0].invoice_url,
            rows[0].created_at
        )

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
            throw new Error('Erro ao recuperar o pagamento cadastrado')
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

const refundPayment = async (refund) => {
    let connection = null

    try {
        connection = await dbPool.getConnection()

        // Inserindo estorno na tabela
        const sqlInsert = 'INSERT INTO refunds (payment_id, status, value, refund_date) VALUES (?, ?, ?, ?)'
        const [insertResult] = await connection.execute(sqlInsert, [
            refund.paymentId,
            refund.status,
            refund.value,
            refund.refundDate
        ])

        const refundId = insertResult.insertId

        const sqlSelect = 'SELECT * FROM refunds WHERE id = ?'
        const [rows] = await connection.execute(sqlSelect, [refundId])

        // Verificando o estorno recuperado
        if (rows.length === 0) {
            throw new NotFoundError('Erro ao recuperar o estorno cadastrado')
        }

        return new Refund(
            rows[0].id,
            rows[0].payment_id,
            rows[0].status,
            rows[0].value,
            rows[0].refund_date,
            rows[0].created_at
        );

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
    
    const sqlUpdate = 'UPDATE payments SET status = ? WHERE id = ?'
    const [ ResultSetHeader ] = await connection.execute(sqlUpdate, [payment.status, payment.id])

    if (ResultSetHeader.changedRows === 0) {
        if (ResultSetHeader.affectedRows === 1) {
            throw new NoContentError('Pagamento atualizado sem alterações')
        }
        throw new NotFoundError('Pagamento não encontrado')
    }

    const sqlSelect = 'SELECT * FROM payments WHERE id = ?'
    const [ rows ] = await connection.execute(sqlSelect, [payment.id])

    // Verificando se o pagamento foi retornado
    if ( rows.length === 0) {
        throw new NotFoundError('Erro ao recuperar o pagamento atualizado')
    }

    return new Payment(
        rows[0].id,
        rows[0].customer_id,
        rows[0].asaas_id,
        rows[0].event_id,
        rows[0].asaas_id,
        rows[0].value,
        rows[0].billing_type,
        rows[0].transaction_date,
        rows[0].due_date,
        rows[0].description,
        rows[0].status,
        rows[0].invoice_url,
        rows[0].created_at
    )

    try {
        connection = dbPool.getConnection()



    } catch (error) {
        console.log(error)
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
    refundPayment
}