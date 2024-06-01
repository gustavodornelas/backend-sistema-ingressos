const { v4: uuidv4 } = require('uuid');

const NoContentError = require('../CustomErrors/NoContentError')
const NotFoundError = require('../CustomErrors/NotFoundError')
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

        const venues =  rows.map(row => new Venue(
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

        return { venues }
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
        const venue = new Venue(
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

        return { venue }
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

const createNewVenue = async (newVenue) => {
    let connection = null
    try {
        connection = await dbPool.getConnection()

        const sqlInsert = 'INSERT INTO venues (id, name, address, address_number, complement, province, city, state, postal_code, capacity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ? )'
        const [insertResult] = await connection.execute(sqlInsert, [
            "ven_" + uuidv4(),
            newVenue.name,
            newVenue.address,
            newVenue.addressNumber,
            newVenue.complement,
            newVenue.province,
            newVenue.city,
            newVenue.state,
            newVenue.postalCode,
            newVenue.capacity,
        ])

        const venueId = insertResult.insertId
        const sqlSelect = 'SELECT * FROM venues WHERE id = ?'
        const [rows] = await connection.execute(sqlSelect, [venueId])

        // Verificando se o local foi retornado
        if (rows === 0) {
            throw new NotFoundError('Erro ao recuperar o local cadastrado')
        }

        const row = rows[0]
        const venue = new Venue(
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

        return { venue }

    } catch (error) {
        console.log(error)
        if (error instanceof NotFoundError) {
            throw error
        }
        throw new Error('Erro ao cadastrar local')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

const updateVenue = async (newVenue) => {
    let connection = null

    try {
        connection = await dbPool.getConnection()

        const sqlUpdate = 'UPDATE venues SET name = ?, address = ?, address_number = ?, complement = ?, province = ?, city = ?, state = ?, postal_code = ?, capacity = ? WHERE id = ?'
        const [ResultSetHeader] = await connection.execute(sqlUpdate, [
            newVenue.name,
            newVenue.address,
            newVenue.addressNumber,
            newVenue.complement,
            newVenue.province,
            newVenue.city,
            newVenue.state,
            newVenue.postalCode,
            newVenue.capacity,
            newVenue.id
        ])

        // Verificando se teve alterações
        if (ResultSetHeader.changedRows === 0) {
            if (ResultSetHeader.affectedRows === 1) {
                throw new NoContentError('Local atualizado sem alterações')
            }
            throw new NotFoundError('Local não encontrado')
        }

        const venueId = newVenue.id
        const sqlSelect = 'SELECT * FROM venues WHERE id = ?'
        const [rows] = await connection.execute(sqlSelect, [venueId])

        // Verificar se o local atualizado foi recuperado
        if (rows.length === 0) {
            throw new NotFoundError('Erro ao retornar o local atualizado')
        }

        const row = rows[0]
        const venue = new Venue(
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

        return { venue }

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

        console.error(ResultSetHeader)

        if (ResultSetHeader.affectedRows === 0) {
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