// services/eventDateService.js
const NoContentError = require('../CustomErrors/NoContentError');
const NotFoundError = require('../CustomErrors/NotFoundError');
const dbPool = require('../config/dbPool');
const EventDate = require('../models/EventDate');

const getAllEventDates = async () => {
    let connection = null;

    try {
        connection = await dbPool.getConnection();

        const sql = 'SELECT * FROM events_dates';
        const [rows] = await connection.execute(sql);

        if (rows.length === 0) {
            throw new NotFoundError('Nenhuma data de evento encontrada');
        }

        return rows.map(row => new EventDate(
            row.id,
            row.event_id,
            row.start_time,
            row.end_time,
            row.created_at
        ));
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
        return new EventDate(
            row.id,
            row.event_id,
            row.start_time,
            row.end_time,
            row.created_at
        );
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

const createNewEventDate = async (eventDate) => {
    let connection = null;

    try {
        connection = await dbPool.getConnection();

        const sqlInsert = 'INSERT INTO events_dates (event_id, start_time, end_time) VALUES (?, ?, ?)';
        const [insertResult] = await connection.execute(sqlInsert, [
            eventDate.eventId,
            eventDate.startTime,
            eventDate.endTime
        ]);

        const eventDateId = insertResult.insertId;
        const sqlSelect = 'SELECT * FROM events_dates WHERE id = ?';
        const [rows] = await connection.execute(sqlSelect, [eventDateId]);

        if (rows.length === 0) {
            throw new NotFoundError('Erro ao retornar a data de evento cadastrada');
        }

        return new EventDate(
            rows[0].id,
            rows[0].event_id,
            rows[0].start_time,
            rows[0].end_time,
            rows[0].created_at
        );
    } catch (error) {
        console.log(error);
        throw new Error('Erro ao cadastrar data de evento');
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

const updateEventDate = async (eventDate) => {
    let connection = null;

    try {
        connection = await dbPool.getConnection();

        const sql = 'UPDATE events_dates SET event_id = ?, start_time = ?, end_time = ? WHERE id = ?';
        const [resultSetHeader] = await connection.execute(sql, [
            eventDate.eventId,
            eventDate.startTime,
            eventDate.endTime,
            eventDate.id
        ]);

        if (resultSetHeader.changedRows === 0) {
            if (resultSetHeader.affectedRows === 1) {
                throw new NoContentError('Data de evento atualizada sem alterações');
            }
            throw new NotFoundError('Data de evento não encontrada');
        }

        const eventDateId = eventDate.id;
        const sqlSelect = 'SELECT * FROM events_dates WHERE id = ?';
        const [rows] = await connection.execute(sqlSelect, [eventDateId]);

        if (rows.length === 0) {
            throw new NotFoundError('Erro ao retornar a data de evento atualizada');
        }

        return new EventDate(
            rows[0].id,
            rows[0].event_id,
            rows[0].start_time,
            rows[0].end_time,
            rows[0].created_at
        );
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
