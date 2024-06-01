const { v4: uuidv4 } = require('uuid');

const NoContentError = require('../CustomErrors/NoContentError')
const NotFoundError = require('../CustomErrors/NotFoundError')
const dbPool = require('../config/dbPool')
const Event = require('../models/Event')

// Consultar todos os eventos ativos
const getAllEvents = async () => {
    let connection = null

    try {
        connection = await dbPool.getConnection()

        const sql = 'SELECT * FROM events WHERE status = ?'
        const [rows] = await connection.execute(sql, [ "ACTIVE" ])

        // Verificando de algum evento foi encontrado
        if (rows.length === 0 ) {
            throw new NotFoundError('Nenhum evento encontrado')
        }

        const events = rows.map(row => new Event(
            row.id,
            row.name,
            row.description,
            row.venue_id,
            row.status,
            row.created_at,
        ))

        return { events }

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

// Consultar um unico evento
const getEvent = async (id) => {
    let connection = null
    try {
        connection = await dbPool.getConnection()

        const sql = 'SELECT * FROM events WHERE id = ?'
        const [rows] = await connection.execute(sql, [id])

        // Verifique se o evento foi encontrado
        if (rows.length === 0) {
            throw new NotFoundError('Evento não encontrado')
        }

        const row = rows[0]
        const event = new Event(
            row.id,
            row.name,
            row.description,
            row.venue_id,
            row.status,
            row.created_at,
        )

        return { event }

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

// Cadastrar um evento
const createNewEvent = async (newEvent) => {
    let connection = null

    try {
        connection = await dbPool.getConnection()

        newEvent.id = "eve_" + uuidv4()

        const sqlInsert = 'INSERT INTO events (id, name, description, venue_id, status) VALUES (?, ?, ?, ?, ?)'
        await connection.execute(sqlInsert, [
            newEvent.id,
            newEvent.name,
            newEvent.description,
            newEvent.venueId,
            newEvent.status ? event.status : "ACTIVE"
        ])

        const sqlSelect = 'SELECT * FROM events WHERE id = ?'
        const [rows] = await connection.execute(sqlSelect,[newEvent.id])

        if (rows.length === 0 ) {
            throw new NotFoundError('Erro ao retornar o evento cadastrado')
        }

        const row = rows[0]
        const event =  new Event(
            row.id,
            row.name,
            row.description,
            row.venue_id,
            row.status,
            row.created_at
        )

        return { event }

    } catch (error) {
        console.log(error)
        throw new Error('Erro ao cadastrar evento')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

// Atualizar um evento
const updateEvent = async (newEvent) => {
    let connection = null

    try {
        connection = await dbPool.getConnection()

        const sql = 'UPDATE events SET name = ?, description = ?, venue_id = ?, status = ? WHERE id = ?'
        const [ResultSetHeader] = await connection.execute(sql, [
            newEvent.name,
            newEvent.description,
            newEvent.venueId,
            newEvent.status,
            newEvent.id
        ])

        // Verificando se teve alterações
        if (ResultSetHeader.changedRows === 0) {
            if (ResultSetHeader.affectedRows === 1) {
                throw new NoContentError('Evento atualizado sem alterações')
            }
            throw new NotFoundError('Evento não encontrado')
        }

        const eventId = newEvent.id
        const sqlSelect = 'SELECT * FROM events WHERE id = ?'
        const [rows] = await connection.execute(sqlSelect,[eventId])

        if (rows.length === 0 ) {
            throw new NotFoundError('Erro ao retornar o evento cadastrado')
        }

        const event = new Event(
            rows[0].id,
            rows[0].name,
            rows[0].description,
            rows[0].venue_id,
            rows[0].created_at
        )

        return { event }

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