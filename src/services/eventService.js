const NoContentError = require('../CustomErrors/NoContentError')
const NotFoundError = require('../CustomErrors/NotFoundError')
const dbPool = require('../config/dbPool')
const Event = require('../models/Event')

const getAllEvents = async () => {
    let connection = null

    try {
        connection = await dbPool.getConnection()

        const sql = 'SELECT * FROM events'
        const [rows] = await connection.execute(sql)

        // Verificando de algum evento foi encontrado
        if (rows.length === 0 ) {
            throw new NotFoundError('Nenhum evento encontrado')
        }

        return rows.map(row => new Event(
            row.id,
            row.name,
            row.description,
            row.venue_id,
            row.created_at,
        ))
    } catch (error) {
        console.log(error)
        if(error instanceof NotFoundError) {
            throw error
        }
        throw new Error('Erro ao buscar eventos')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

const getEvent = async (id) => {
    let connection = null
    try {
        connection = await dbPool.getConnection()

        const sql = 'SELECT * FROM events WHERE id = ?'
        const [rows] = await connection.execute(sql, [id])

        // Verifique se o evento foi encontrado
        if (rows.length === 0) {
            throw new NotFoundError('Cliente não encontrado')
        }

        const row = rows[0]
        return new Event(
            row.id,
            row.name,
            row.description,
            row.venue_id,
            row.created_at,
        )
    } catch (error) {
        console.log(error)
        if (error instanceof NotFoundError) {
            throw error
        }
        throw new Error('Erro ao buscar evento')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

const createNewEvent = async (event) => {
    let connection = null

    try {
        connection = await dbPool.getConnection()

        const sqlInsert = 'INSERT INTO events (name, description, venue_id) VALUES (?, ?, ?)'
        const [insertResult] = await connection.execute(sqlInsert, [
            event.name,
            event.description,
            event.venueId,
        ])

        const eventId = insertResult.insertId
        const sqlSelect = 'SELECT * FROM events WHERE id = ?'
        const [rows] = await connection.execute(sqlSelect,[eventId])

        if (rows.length === 0 ) {
            throw new NotFoundError('Erro ao retornar o evento cadastrado')
        }

        return new Event(
            rows[0].id,
            rows[0].name,
            rows[0].description,
            rows[0].venue_id,
            rows[0].created_at
        ) // Retorna o evento criado

    } catch (error) {
        console.log(error)
        throw new Error('Erro ao cadastrar evento')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

const updateEvent = async (event) => {
    let connection = null

    try {
        connection = await dbPool.getConnection()

        const sql = 'UPDATE events SET name = ?, description = ?, venue_id = ? WHERE id = ?'
        const [ResultSetHeader] = await connection.execute(sql, [
            event.name,
            event.description,
            event.venueId,
            event.id
        ])

        // Verificando se teve alterações
        if (ResultSetHeader.changedRows === 0) {
            if (ResultSetHeader.affectedRows === 1) {
                throw new NoContentError('Evento atualizado sem alterações')
            }
            throw new NotFoundError('Evento não encontrado')
        }

        const eventId = event.id
        const sqlSelect = 'SELECT * FROM events WHERE id = ?'
        const [rows] = await connection.execute(sqlSelect,[eventId])

        if (rows.length === 0 ) {
            throw new NotFoundError('Erro ao retornar o evento cadastrado')
        }

        return new Event(
            rows[0].id,
            rows[0].name,
            rows[0].description,
            rows[0].venue_id,
            rows[0].created_at
        ) // Retorna o evento criado


    } catch (error) {
        console.log(error)
        if (error instanceof NotFoundError || NoContentError) {
            throw error
        }
        throw new Error('Erro ao atualizar evento')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

const deleteEvent = async (id) => {
    let connection = null

    try {
        connection = await dbPool.getConnection()

        const sql = 'DELETE FROM events WHERE id = ?'
        const [ResultSetHeader] = await connection.execute(sql, [id])

        if (ResultSetHeader.affectedRows === 0) {
            // Reverter a transação se o evento não for encontrado
            throw new NotFoundError('Evento não encontrado')
        } 

    } catch (error) {
        console.log(error)
        if (error instanceof NotFoundError) {
            throw error
        }
        throw new Error('Erro ao buscar local')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

module.exports = {
    getAllEvents,
    getEvent,
    createNewEvent,
    updateEvent,
    deleteEvent
}