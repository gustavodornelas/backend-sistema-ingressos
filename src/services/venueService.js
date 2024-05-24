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

        const sqlInsert = 'INSERT INTO venues (name, address, address_number, complement, province, city, state, postal_code, capacity) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ? )'
        const [insertResult] = await connection.execute(sqlInsert, [
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

        const venueId = insertResult.insertId
        const sqlSelect = 'SELECT * FROM venues WHERE id = ?'
        const [rows] = await connection.execute(sqlSelect, [venueId])

        // Verificando se o local foi retornado
        if (rows === 0) {
            throw new NotFoundError('Erro ao recuperar o local cadastrado')
        }

        return new Venue(
            rows[0].id,
            rows[0].name,
            rows[0].address,
            rows[0].address_number,
            rows[0].complement,
            rows[0].province,
            rows[0].city,
            rows[0].state,
            rows[0].postal_code,
            rows[0].capacity,
            rows[0].created_at
        )

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

const updateVenue = async (venue) => {
    let connection = null

    try {
        connection = await dbPool.getConnection()

        const sqlUpdate = 'UPDATE venues SET name = ?, address = ?, address_number = ?, complement = ?, province = ?, city = ?, state = ?, postal_code = ?, capacity = ? WHERE id = ?'
        const [ResultSetHeader] = await connection.execute(sqlUpdate, [
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

        const venueId = venue.id
        const sqlSelect = 'SELECT * FROM venues WHERE id = ?'
        const [rows] = await connection.execute(sqlSelect, [venueId])

        // Verificar se o local atualizado foi recuperado
        if (rows.length === 0) {
            throw new NotFoundError('Erro ao retornar o local atualizado')
        }

        return new Venue(
            rows[0].id,
            rows[0].name,
            rows[0].address,
            rows[0].address_number,
            rows[0].complement,
            rows[0].province,
            rows[0].city,
            rows[0].state,
            rows[0].postal_code,
            rows[0].capacity,
            rows[0].created_at
        ) // Retornando o local cadastrado

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