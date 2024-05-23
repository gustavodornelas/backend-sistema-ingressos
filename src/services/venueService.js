const NoContentError = require('../CustomErrors/NoContentError')
const NotFoundError = require('../CustomErrors/SystemError')
const dbPool = require('../config/dbPool')
const Venue = require('../models/Venue')

const getAllVenues = async () => {
    let connection = null

    try {
        connection = await dbPool.getConnection()

        const sql = 'SELECT * FROM venues'
        const [rows] = await connection.execute(sql)

        // Verificando se algum local foi encontrado
        if (rows.length === 0) { 
            throw new NotFoundError('Nenhum local foi encontrado')
        }

        return rows.map(row => new Venue(
            row.id,
            row.name,
            row.address,
            row.address_number,
            row.complement,
            row.province,
            row.city,
            row.state,
            row.zip_code,
            row.capacity,
            row.created_at,
        ))
    } catch (error) {
        console.log(error)
        if (error instanceof NotFoundError) {
            throw error
        }
        throw new Error('Erro ao buscar locais')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

const getVenue = async (id) => {
    let connection = null

    try {
        connection = await dbPool.getConnection()

        const sql = 'SELECT * FROM venues WHERE id = ?'
        const [rows] = await connection.execute(sql, [id])

        // Verificando se o local foi encontrado
        if (rows.length === 0) {
            throw new NotFoundError('Local não encontrado')
        }

        const row = rows[0]
        return new Venue(
            row.id,
            row.name,
            row.address,
            row.address_number,
            row.complement,
            row.province,
            row.city,
            row.state,
            row.zip_code,
            row.capacity,
            row.created_at,
        )
    } catch (error) {
        console.log(error)
        if (error instanceof NotFoundError) {
            throw error
        }
        throw new Error('Erro ao buscar locais')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

const createNewVenue = async (venue) => {
    let connection = null
    console.log(venue)
    try {
        connection = await dbPool.getConnection()

        const sql = 'INSERT INTO venues (name, address, address_number, complement, province, city, state, postal_code, capacity) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ? )'
        await connection.execute(sql, [
            venue.name,
            venue.address,
            venue.addressNumber,
            venue.complement,
            venue.province,
            venue.city,
            venue.state,
            venue.postalCode,
            venue.capacity,
        ])

    } catch (error) {
        console.log(error)
        throw new Error('Erro ao cadastrar local')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

const updateVenue = async (venue) => {
    let connection = null

    try {
        connection = await dbPool.getConnection()

        const sql = 'UPDATE venues SET name = ?, address = ?, address_number = ?, complement = ?, province = ?, city = ?, state = ?, postal_code = ?, capacity = ? WHERE id = ?'
        const [ResultSetHeader] = await connection.execute(sql, [
            venue.name,
            venue.address,
            venue.addressNumber,
            venue.complement,
            venue.province,
            venue.city,
            venue.state,
            venue.postalCode,
            venue.capacity,
            venue.id
        ])

        // Verificando se teve alterações
        if (ResultSetHeader.changedRows === 0) {
            if (ResultSetHeader.affectedRows === 1) {
                throw new NoContentError('Local atualizado sem alterações')
            }
            throw new NotFoundError('Local não encontrado')
        }

    } catch (error) {
        console.log(error)
        if (error instanceof NotFoundError || NoContentError) {
            throw error
        }
        throw new Error('Erro ao buscar usuário')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

const deleteVenue = async (id) => {
    let connection = null

    try {
        connection = await dbPool.getConnection()

        const sql = 'DELETE FROM venues WHERE id = ?'
        const [ResultSetHeader] = await connection.execute(sql, [id])

        if (ResultSetHeader.affectedRows === 0) {
            // Reverter a transação se o cliente não for encontrado
            throw new NotFoundError('Local não encontrado')
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
    getAllVenues,
    getVenue,
    createNewVenue,
    updateVenue,
    deleteVenue
}