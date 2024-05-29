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

        const tickets = rows.map(row => new Ticket(
            row.id,
            row.batch_id,
            row.event_id,
            row.eventDate_id,
            row.customer_id,
            row.payment_id,
            row.purchase_date,
            row.price,
            row.qr_code,
            row.status,
            row.created_at
        ))

        return { tickets }
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
        const ticket = new Ticket(
            row.id,
            row.batch_id,
            row.event_id,
            row.eventDate_id,
            row.customer_id,
            row.payment_id,
            row.purchase_date,
            row.price,
            row.qr_code,
            row.status,
            row.created_at
        )

        return { ticket }
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

const createNewTicket = async (newTicket) => {
    let connection = null;

    try {
        connection = await dbPool.getConnection();
        connection.beginTransaction();

        newTicket.qrCode = uuidv4();

        const sqlSelect1 = 'SELECT * FROM ticket_batches WHERE id = ?'
        const [rows1] = await connection.execute(sqlSelect1, [newTicket.batchId]);

        if (rows1.length === 0) {
            throw new NotFoundError('Erro ao buscar lote de ingressos');
        }

        const availableQuantity = rows1[0].available_quantity

        const sqlUpdate = 'UPDATE ticket_batches SET available_quantity = ? WHERE id = ?'
        const [updateResult] = await connection.execute(sqlUpdate, [availableQuantity - 1, newTicket.batchId])

        if (updateResult.changedRows === 0) {
            throw new NotFoundError('Erro ao atualizar lote de ingressos')
        }


        const sqlInsert = 'INSERT INTO tickets (batch_id, event_id, eventDate_id, customer_id, payment_id, purchase_date, price, qr_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        const [insertResult] = await connection.execute(sqlInsert, [
            newTicket.batchId,
            newTicket.eventId,
            newTicket.eventDateId,
            newTicket.customerId,
            newTicket.paymentId,
            newTicket.purchaseDate,
            newTicket.price,
            newTicket.qrCode,
        ]);

        const ticketId = insertResult.insertId;
        const sqlSelect2 = 'SELECT * FROM tickets WHERE id = ?';
        const [rows2] = await connection.execute(sqlSelect2, [ticketId]);

        if (rows2.length === 0) {
            throw new NotFoundError('Erro ao retornar o ingresso cadastrado');
        }

        connection.commit();

        const row = rows2[0];
        const ticket = new Ticket(
            row.id,
            row.batch_id,
            row.event_id,
            row.eventDate_id,
            row.customer_id,
            row.payment_id,
            row.purchase_date,
            row.price,
            row.qr_code,
            row.status,
            row.created_at
        )

        return { ticket }
    } catch (error) {
        connection.rollback();
        console.log(error);
        if (error instanceof NotFoundError) {
            throw error
        }
        throw new Error('Erro ao cadastrar ingresso');
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

const updateTicket = async (newTicket) => {
    let connection = null;

    try {
        connection = await dbPool.getConnection();

        const sql = 'UPDATE tickets SET batch_id = ?, event_id = ?, eventDate_id = ?, customer_id = ?, payment_id = ?,  price = ?, status = ? WHERE id = ?';
        const [resultSetHeader] = await connection.execute(sql, [
            newTicket.batchId,
            newTicket.eventId,
            newTicket.eventDateId,
            newTicket.customerId,
            newTicket.paymentId,
            newTicket.price,
            newTicket.status,
            newTicket.id
        ]);

        if (resultSetHeader.changedRows === 0) {
            if (resultSetHeader.affectedRows === 1) {
                throw new NoContentError('Ingresso atualizado sem alterações');
            }
            throw new NotFoundError('Ingresso não encontrado');
        }

        const ticketId = newTicket.id;
        const sqlSelect = 'SELECT * FROM tickets WHERE id = ?';
        const [rows] = await connection.execute(sqlSelect, [ticketId]);

        if (rows.length === 0) {
            throw new NotFoundError('Erro ao retornar o ingresso atualizado');
        }

        const row = rows[0];
        const ticket = new Ticket(
            row.id,
            row.batch_id,
            row.event_id,
            row.eventDate_id,
            row.customer_id,
            row.payment_id,
            row.purchase_date,
            row.price,
            row.qr_code,
            row.status,
            row.created_at
        )

        return { ticket }
    } catch (error) {
        console.log(error);
        if (error instanceof NotFoundError || NoContentError) {
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
