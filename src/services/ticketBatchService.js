const { v4: uuidv4 } = require('uuid');

const dbPool = require('../config/dbPool')
const TicketBatch = require('../models/TicketBatch')
const NoContentError = require('../CustomErrors/NoContentError')
const NotFoundError = require('../CustomErrors/NotFoundError')

const getAllTicketBatches = async () => {
    let connection = null

    try {
        connection = await dbPool.getConnection()
        const sql = 'SELECT * FROM ticket_batches WHERE status = ?'
        const [rows] = await connection.execute(sql, [ "ACTIVE" ])

        if (rows.length === 0) {
            throw new NotFoundError('Nenhum lote de ingressos encontrado')
        }

        const ticketBatches = rows.map(row => new TicketBatch(
            row.id,
            row.event_id,
            row.single_date_batch,
            row.event_date_id,
            row.description,
            row.quantity,
            row.available_quantity,
            row.price,
            row.batch_date,
            row.status,
            row.created_at
        ))

        return { ticketBatches }
    } catch (error) {
        console.log(error)
        if (error instanceof NotFoundError) {
            throw error
        }
        throw new Error('Erro ao buscar lotes de ingressos')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

const getAllEventTicketBatches = async (id) => {
    let connection = null

    try {
        connection = await dbPool.getConnection()
        const sql = 'SELECT * FROM ticket_batches WHERE event_id = ? and status = ?'
        const [rows] = await connection.execute(sql, [ id , "ACTIVE" ])

        if (rows.length === 0) {
            throw new NotFoundError('Nenhum lote de ingressos encontrado')
        }

        const ticketBatches = rows.map(row => new TicketBatch(
            row.id,
            row.event_id,
            row.single_date_batch,
            row.event_date_id,
            row.description,
            row.quantity,
            row.available_quantity,
            row.price,
            row.batch_date,
            row.status,
            row.created_at
        ))

        return { ticketBatches }
    } catch (error) {
        console.log(error)
        if (error instanceof NotFoundError) {
            throw error
        }
        throw new Error('Erro ao buscar lotes de ingressos')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

const getTicketBatch = async (id) => {
    let connection = null

    try {
        connection = await dbPool.getConnection()
        const sql = 'SELECT * FROM ticket_batches WHERE id = ?'
        const [rows] = await connection.execute(sql, [id])

        if (rows.length === 0) {
            throw new NotFoundError('Lote de ingressos não encontrado')
        }

        const row = rows[0]
        const ticketBatch = new TicketBatch(
            row.id,
            row.event_id,
            row.single_date_batch,
            row.event_date_id,
            row.description,
            row.quantity,
            row.available_quantity,
            row.price,
            row.batch_date,
            row.status,
            row.created_at
        )

        return { ticketBatch }
    } catch (error) {
        console.log(error)
        if (error instanceof NotFoundError) {
            throw error
        }
        throw new Error('Erro ao buscar lote de ingressos')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

const createNewTicketBatch = async (newTicketBatch) => {
    let connection = null

    try {
        connection = await dbPool.getConnection()

        newTicketBatch.id = "bat_" + uuidv4()

        const sqlInsert = 'INSERT INTO ticket_batches (id, event_id, single_date_batch, event_date_id, description, quantity, available_quantity, price, batch_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        await connection.execute(sqlInsert, [
            newTicketBatch.id,
            newTicketBatch.eventId,
            newTicketBatch.singleDateBatch,
            newTicketBatch.eventDateId ? newTicketBatch.eventDateId : null,
            newTicketBatch.description,
            newTicketBatch.quantity,
            newTicketBatch.availableQuantity,
            newTicketBatch.price,
            newTicketBatch.batchDate,
            newTicketBatch.status ? newTicketBatch.status : "ACTIVE"
        ])

        const sqlSelect = 'SELECT * FROM ticket_batches WHERE id = ?'
        const [rows] = await connection.execute(sqlSelect, [newTicketBatch.id])

        if (rows.length === 0) {
            throw new NotFoundError('Erro ao retornar o lote de ingressos cadastrado')
        }

        const row = rows[0]
        const ticketBatch = new TicketBatch(
            row.id,
            row.event_id,
            row.single_date_batch,
            row.event_date_id,
            row.description,
            row.quantity,
            row.available_quantity,
            row.price,
            row.batch_date,
            row.status,
            row.created_at
        )

        return { ticketBatch }
    } catch (error) {
        console.log(error)
        if (error instanceof NotFoundError) {
            throw error
        }
        throw new Error('Erro ao cadastrar lote de ingressos')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

const updateTicketBatch = async (newTicketBatch) => {
    let connection = null

    try {
        connection = await dbPool.getConnection()
        
        const sql = 'UPDATE ticket_batches SET event_id = ?, single_date_batch = ?, event_date_id = ?, description = ?, quantity = ?, available_quantity = ?, price = ?, batch_date = ?, status = ? WHERE id = ?'
        const [resultSetHeader] = await connection.execute(sql, [
            newTicketBatch.eventId,
            newTicketBatch.singleDateBatch,
            newTicketBatch.eventDateId ? newTicketBatch.eventDateId : null,
            newTicketBatch.description,
            newTicketBatch.quantity,
            newTicketBatch.availableQuantity,
            newTicketBatch.price,
            newTicketBatch.batchDate,
            newTicketBatch.status,
            newTicketBatch.id
        ])

        if (resultSetHeader.changedRows === 0) {
            if (resultSetHeader.affectedRows === 1) {
                throw new NoContentError('Lote de ingressos atualizado sem alterações')
            }
            throw new NotFoundError('Lote de ingressos não encontrado')
        }

        const ticketBatchId = ticketBatch.id
        const sqlSelect = 'SELECT * FROM ticket_batches WHERE id = ?'
        const [rows] = await connection.execute(sqlSelect, [ticketBatchId])

        if (rows.length === 0) {
            throw new NotFoundError('Erro ao retornar o lote de ingressos atualizado')
        }

        const row = rows[0]
        const ticketBatch = new TicketBatch(
            row.id,
            row.event_id,
            row.single_date_batch,
            row.event_date_id,
            row.description,
            row.quantity,
            row.available_quantity,
            row.price,
            row.batch_date,
            row.status,
            row.created_at
        )

        return { ticketBatch }
    } catch (error) {
        console.log(error)
        if (error instanceof NotFoundError || NoContentError) {
            throw error
        }
        throw new Error('Erro ao atualizar lote de ingressos')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

const bookTicket = async (solicitedTickets) => {
    let connection = null

    try {
        connection = await dbPool.getConnection()
        connection.beginTransaction()

        await Promise.all(solicitedTickets.map(async (solicitedTicket) => {
            const {ticketBatch: id, quantity} = solicitedTicket

            const sqlSelect = "SELECT available_quantity, reserved_quantity FROM ticket_batches WHERE id = ?"
            const [selectResult] = await connection.execute(sqlSelect, [id]);

            if (selectResult === 0) {
                throw new NotFoundError("Erro ao encontrar lote de ingressos")
            }

            const reservedQuantity = parseInt(selectResult[0].reserved_quantity)
            const availableQuantity = parseInt(selectResult[0].available_quantity)

            if (availableQuantity-reservedQuantity < quantity) {
                throw new Error("Quantidade solicitada menor que a quantidade disponivel")
            }

            const sqlUpdate = "UPDATE ticket_batches SET reserved_quantity = ? WHERE id = ?"
            const [resultSetHeader] = await connection.execute(sqlUpdate, [reservedQuantity + quantity, id])

            if (resultSetHeader.changedRows === 0) {
                if (resultSetHeader.affectedRows === 1) {
                    throw new NoContentError('Lote de ingressos atualizado sem alterações')
                }
                throw new NotFoundError('Lote de ingressos não encontrado')
            }
        }))

        connection.commit()

    } catch (error) {
        connection.rollback()
        console.error(error)
        if (error instanceof NotFoundError || NoContentError) {
            throw error
        }
        throw new Error('Erro ao reservar ingresssos')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

const deleteTicketBatch = async (id) => {
    let connection = null

    try {
        connection = await dbPool.getConnection()

        const sql = 'DELETE FROM ticket_batches WHERE id = ?'
        const [resultSetHeader] = await connection.execute(sql, [id])

        if (resultSetHeader.affectedRows === 0) {
            throw new NotFoundError('Lote de ingressos não encontrado')
        }
    } catch (error) {
        console.log(error)
        if (error instanceof NotFoundError) {
            throw error
        }
        throw new Error('Erro ao deletar lote de ingressos')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

module.exports = {
    getAllTicketBatches,
    getAllEventTicketBatches,
    getTicketBatch,
    createNewTicketBatch,
    updateTicketBatch,
    bookTicket,
    deleteTicketBatch
}
