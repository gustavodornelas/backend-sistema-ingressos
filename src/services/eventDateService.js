// services/eventDateService.js
const NoContentError = require('../CustomErrors/NoContentError');
const NotFoundError = require('../CustomErrors/NotFoundError');
const dbPool = require('../config/dbPool');
const EventDate = require('../models/EventDate');

// Consultar todas as Datas de um evento ativas
const getAllEventDates = async (eventId) => {
    let connection = null;

    try {
        connection = await dbPool.getConnection();

        const sql = 'SELECT * FROM events_dates WHERE event_id = ? and status = ?';
        const [rows] = await connection.execute(sql, [ eventId, "ACTIVE" ]);
        console.log(rows)
        if (rows.length === 0) {
            throw new NotFoundError('Nenhuma data de evento encontrada');
        }


        const eventDates =  rows.map(row => new EventDate(
            row.id,
            row.event_id,
            row.start_time,
            row.end_time,
            row.status,
            row.created_at
        ))

        return { eventDates }
    } catch (error) {
        console.log(error);
        if (error instanceof NotFoundError) {
            throw error;
        }
        throw new Error('Erro ao buscar datas de eventos');
    } finally {
        if (connection) {
            connection.release();
        }
    }
};


// Consultar uma unica data de evento
const getEventDate = async (id) => {
    let connection = null;

    try {
        connection = await dbPool.getConnection();

        const sql = 'SELECT * FROM events_dates WHERE id = ?';
        const [rows] = await connection.execute(sql, [id]);

        if (rows.length === 0) {
            throw new NotFoundError('Data de evento não encontrada');
        }

        const row = rows[0];
        const eventDate = new EventDate(
            row.id,
            row.event_id,
            row.start_time,
            row.end_time,
            row.status,
            row.created_at
        )

        return { eventDate }
    } catch (error) {
        console.log(error);
        if (error instanceof NotFoundError) {
            throw error;
        }
        throw new Error('Erro ao buscar data de evento');
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// Cadastrar um novo evento
const createNewEventDate = async (NewEventDate) => {
    let connection = null;

    try {
        connection = await dbPool.getConnection();

        const sqlInsert = 'INSERT INTO events_dates (event_id, start_time, status, end_time) VALUES (?, ?, ?, ?)';
        const [insertResult] = await connection.execute(sqlInsert, [
            NewEventDate.eventId,
            NewEventDate.startTime,
            NewEventDate.status ? NewEventDate.status : "ACTIVE",
            NewEventDate.endTime
        ]);

        const eventDateId = insertResult.insertId;
        const sqlSelect = 'SELECT * FROM events_dates WHERE id = ?';
        const [rows] = await connection.execute(sqlSelect, [eventDateId]);

        if (rows.length === 0) {
            throw new NotFoundError('Erro ao retornar a data de evento cadastrada');
        }

        const row = rows[0]
        const eventDate = new EventDate(
            row.id,
            row.event_id,
            row.start_time,
            row.end_time,
            row.status,
            row.created_at
        )

        return { eventDate }
        
    } catch (error) {
        console.log(error);
        throw new Error('Erro ao cadastrar data de evento');
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// Atualizar um evento
const updateEventDate = async (newEventDate) => {
    let connection = null;

    try {
        connection = await dbPool.getConnection();

        const sql = 'UPDATE events_dates SET event_id = ?, start_time = ?, end_time = ?, status = ? WHERE id = ?';
        const [resultSetHeader] = await connection.execute(sql, [
            newEventDate.eventId,
            newEventDate.startTime,
            newEventDate.endTime,
            newEventDate.status,
            newEventDate.id
        ]);

        if (resultSetHeader.changedRows === 0) {
            if (resultSetHeader.affectedRows === 1) {
                throw new NoContentError('Data de evento atualizada sem alterações');
            }
            throw new NotFoundError('Data de evento não encontrada');
        }

        const eventDateId = newEventDate.id;
        const sqlSelect = 'SELECT * FROM events_dates WHERE id = ?';
        const [rows] = await connection.execute(sqlSelect, [eventDateId]);

        if (rows.length === 0) {
            throw new NotFoundError('Erro ao retornar a data de evento atualizada');
        }

        const row = rows[0]
        const eventDate = new EventDate(
            row.id,
            row.event_id,
            row.start_time,
            row.end_time,
            row.status,
            row.created_at
        )

        return { eventDate }
    } catch (error) {
        console.log(error);
        if (error instanceof NotFoundError || error instanceof NoContentError) {
            throw error;
        }
        throw new Error('Erro ao atualizar data de evento');
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// Deletar uma data de evento
const deleteEventDate = async (id) => {
    let connection = null;

    try {
        connection = await dbPool.getConnection();

        const sql = 'DELETE FROM events_dates WHERE id = ?';
        const [resultSetHeader] = await connection.execute(sql, [id]);

        if (resultSetHeader.affectedRows === 0) {
            throw new NotFoundError('Data de evento não encontrada');
        }
    } catch (error) {
        console.log(error);
        if (error instanceof NotFoundError) {
            throw error;
        }
        throw new Error('Erro ao deletar data de evento');
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    getAllEventDates,
    getEventDate,
    createNewEventDate,
    updateEventDate,
    deleteEventDate
};
