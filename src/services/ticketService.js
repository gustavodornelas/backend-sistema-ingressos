const { v4: uuidv4 } = require('uuid');
const NoContentError = require('../CustomErrors/NoContentError');
const NotFoundError = require('../CustomErrors/NotFoundError');
const dbPool = require('../config/dbPool');
const Ticket = require('../models/Ticket');

const getAllTickets = async () => {
    let connection = null;

    try {
        connection = await dbPool.getConnection();

        const sql = 'SELECT * FROM tickets';
        const [rows] = await connection.execute(sql);

        if (rows.length === 0) {
            throw new NotFoundError('Nenhum ingresso encontrado');
        }

        return rows.map(row => new Ticket(
            row.id,
            row.event_id,
            row.eventDate_id,
            row.customer_id,
            row.payment_id,
            row.purchase_date,
            row.price,
            row.qr_code,
            row.created_at
        ));
    } catch (error) {
        console.log(error);
        if (error instanceof NotFoundError) {
            throw error;
        }
        throw new Error('Erro ao buscar ingressos');
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

const getTicket = async (id) => {
    let connection = null;

    try {
        connection = await dbPool.getConnection();

        const sql = 'SELECT * FROM tickets WHERE id = ?';
        const [rows] = await connection.execute(sql, [id]);

        if (rows.length === 0) {
            throw new NotFoundError('Ingresso não encontrado');
        }

        const row = rows[0];
        return new Ticket(
            row.id,
            row.event_id,
            row.eventDate_id,
            row.customer_id,
            row.payment_id,
            row.purchase_date,
            row.price,
            row.qr_code,
            row.created_at
        );
    } catch (error) {
        console.log(error);
        if (error instanceof NotFoundError) {
            throw error;
        }
        throw new Error('Erro ao buscar ingresso');
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

const createNewTicket = async (ticket) => {
    let connection = null;

    try {
        connection = await dbPool.getConnection();

        ticket.qrCode = uuidv4();

        const sqlInsert = 'INSERT INTO tickets (event_id, eventDate_id, customer_id, payment_id, purchase_date, price, qr_code) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const [insertResult] = await connection.execute(sqlInsert, [
            ticket.eventId,
            ticket.eventDateId,
            ticket.customerId,
            ticket.paymentId,
            ticket.purchaseDate,
            ticket.price,
            ticket.qrCode,
        ]);

        const ticketId = insertResult.insertId;
        const sqlSelect = 'SELECT * FROM tickets WHERE id = ?';
        const [rows] = await connection.execute(sqlSelect, [ticketId]);

        if (rows.length === 0) {
            throw new NotFoundError('Erro ao retornar o ingresso cadastrado');
        }

        return new Ticket(
            rows[0].id,
            rows[0].event_id,
            rows[0].eventDate_id,
            rows[0].customer_id,
            rows[0].payment_id,
            rows[0].purchase_date,
            rows[0].price,
            rows[0].qr_code,
            rows[0].created_at
        );
    } catch (error) {
        console.log(error);
        throw new Error('Erro ao cadastrar ingresso');
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

const updateTicket = async (ticket) => {
    let connection = null;

    try {
        connection = await dbPool.getConnection();

        const sql = 'UPDATE tickets SET event_id = ?, eventDate_id = ?, customer_id = ?, payment_id = ?, purchase_date = ?, price = ?, WHERE id = ?';
        const [resultSetHeader] = await connection.execute(sql, [
            ticket.eventId,
            ticket.eventDateId,
            ticket.customerId,
            ticket.paymentId,
            ticket.purchaseDate,
            ticket.price,
            ticket.id
        ]);

        if (resultSetHeader.changedRows === 0) {
            if (resultSetHeader.affectedRows === 1) {
                throw new NoContentError('Ingresso atualizado sem alterações');
            }
            throw new NotFoundError('Ingresso não encontrado');
        }

        const ticketId = ticket.id;
        const sqlSelect = 'SELECT * FROM tickets WHERE id = ?';
        const [rows] = await connection.execute(sqlSelect, [ticketId]);

        if (rows.length === 0) {
            throw new NotFoundError('Erro ao retornar o ingresso atualizado');
        }

        return new Ticket(
            rows[0].id,
            rows[0].event_id,
            rows[0].eventDate_id,
            rows[0].customer_id,
            rows[0].payment_id,
            rows[0].purchase_date,
            rows[0].price,
            rows[0].qr_code,
            rows[0].created_at
        );
    } catch (error) {
        console.log(error);
        if (error instanceof NotFoundError || error instanceof NoContentError) {
            throw error;
        }
        throw new Error('Erro ao atualizar ingresso');
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

const deleteTicket = async (id) => {
    let connection = null;

    try {
        connection = await dbPool.getConnection();

        const sql = 'DELETE FROM tickets WHERE id = ?';
        const [resultSetHeader] = await connection.execute(sql, [id]);

        if (resultSetHeader.affectedRows === 0) {
            throw new NotFoundError('Ingresso não encontrado');
        }
    } catch (error) {
        console.log(error);
        if (error instanceof NotFoundError) {
            throw error;
        }
        throw new Error('Erro ao deletar ingresso');
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    getAllTickets,
    getTicket,
    createNewTicket,
    updateTicket,
    deleteTicket
};
