const { v4: uuidv4 } = require('uuid');

const NoContentError = require('../CustomErrors/NoContentError')
const NotFoundError = require('../CustomErrors/NotFoundError')
const dbPool = require('../config/dbPool')
const CartItem = require('../models/CartItem')

// Consultar carrinho de compras de um cliente
const getAllCartItems = async (customerId) => {
    let connection = null

    try {
        connection = await dbPool.getConnection()

        const sql = 'SELECT * FROM cart WHERE customer_id = ?'
        const [rows] = await connection.execute(sql, [customerId])

        if (rows.length === 0) {
            throw new NotFoundError('Nenhum item encontrado no carrinho')
        }

        const cartItems = rows.map(row => new CartItem(
            row.id,
            row.customer_id,
            row.ticket_batch_id,
            row.quantity,
            row.added_at
        ))

        return { cartItems }

    } catch (error) {
        console.log(error)
        if (error instanceof NotFoundError) {
            throw error
        }
        throw new Error('Erro ao buscar itens do carrinho')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

// Consultar um unico item do carrinho de compras
const getCartItemById = async (id) => {
    let connection = null

    try {
        connection = await dbPool.getConnection()

        const sql = 'SELECT * FROM cart WHERE id = ?'
        const [rows] = await connection.execute(sql, [id])

        if (rows.length === 0) {
            throw new NotFoundError('Item do carrinho não encontrado')
        }

        const row = rows[0]
        const cartItem = new CartItem(
            row.id,
            row.customer_id,
            row.ticket_batch_id,
            row.quantity,
            row.added_at
        )

        return { cartItem }

    } catch (error) {
        console.log(error)
        if (error instanceof NotFoundError) {
            throw error
        }
        throw new Error('Erro ao buscar item do carrinho')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

// Adicionar item ao carrinho de compras
const addItemToCart = async (customerId, ticketBatchId, quantity) => {
    let connection = null

    try {
        connection = await dbPool.getConnection()

        // Verifica se o item já está no carrinho
        const sqlSelect1 = 'SELECT * FROM cart WHERE customer_id = ? AND ticket_batch_id = ?'
        const [rows1] = await connection.execute(sqlSelect1, [customerId, ticketBatchId])


        let cartItemId = null
        if (rows1.length > 0) {
            // Se o item já está no carrinho, incrementa a quantidade
            const sqlUpdate = 'UPDATE cart SET quantity = quantity + ? WHERE customer_id = ? AND ticket_batch_id = ?'
            const [resultSetHeader] = await connection.execute(sqlUpdate, [quantity, customerId, ticketBatchId])

            if (resultSetHeader.changedRows === 0) {
                if (resultSetHeader.affectedRows === 1) {
                    throw new NoContentError('Carrinho atualizado sem alterações')
                }
                throw new NotFoundError('Item no carrinho não encontrado')
            }

            cartItemId = rows1[0].id
        } else {
            // Caso contrário, adiciona um novo item ao carrinho
            const sqlInsert = 'INSERT INTO cart (id, customer_id, ticket_batch_id, quantity) VALUES (?, ?, ?, ?)'
            
            cartItemId =  "car_" + uuidv4()
            
            await connection.execute(sqlInsert, [
                cartItemId,
                customerId, 
                ticketBatchId, 
                quantity
            ])

        }

        // Busca o item adicionado ou alterado
        const sqlSelect2 = 'SELECT * FROM cart WHERE id = ?'
        const [rows2] = await connection.execute(sqlSelect2, [cartItemId])

        if (rows2.length === 0) {
            throw new NotFoundError('Erro ao retornar o item no carrinho')
        }

        const row = rows2[0]
        const cartItem = new CartItem(
            row.id,
            row.customer_id,
            row.ticket_batch_id,
            row.quantity,
            row.added_at
        )

        return { cartItem }

    } catch (error) {
        console.log(error)
        if (error instanceof NotFoundError || NoContentError) {
            throw error
        }
        throw new Error('Erro ao adicionar item ao carrinho')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

// Atualizar um item do carrinho de compras
const updateCartItem = async (customerId, ticketBatchId, quantity) => {
    let connection = null

    try {
        connection = await dbPool.getConnection()

        const sql = 'UPDATE cart SET quantity = ? WHERE customer_id = ? AND ticket_batch_id = ?'
        const [result] = await connection.execute(sql, [quantity, customerId, ticketBatchId])

        if (result.affectedRows === 0) {
            throw new NotFoundError('Item não encontrado no carrinho')
        }

        // Busca o item alterado
        const sqlSelect = 'SELECT * FROM cart WHERE customer_id = ? AND ticket_batch_id = ?'
        const [rows] = await connection.execute(sqlSelect, [customerId, ticketBatchId])

        if (rows.length === 0) {
            throw new NotFoundError('Erro ao retornar o item no carrinho')
        }

        const row = rows[0]
        const cartItem = new CartItem(
            row.id,
            row.customer_id,
            row.ticket_batch_id,
            row.quantity,
            row.added_at
        )

        return { cartItem }

    } catch (error) {
        console.log(error)
        if (error instanceof NotFoundError) {
            throw error
        }
        throw new Error('Erro ao atualizar item do carrinho')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

// Remover um item do carrinho de compras
const removeItemFromCart = async (customerId, ticketBatchId) => {
    let connection = null

    try {
        connection = await dbPool.getConnection()

        const sql = 'DELETE FROM cart WHERE customer_id = ? AND ticket_batch_id = ?'
        const [result] = await connection.execute(sql, [customerId, ticketBatchId])

        if (result.affectedRows === 0) {
            throw new NotFoundError('Item não encontrado no carrinho')
        }

    } catch (error) {
        console.log(error)
        if (error instanceof NotFoundError) {
            throw error
        }
        throw new Error('Erro ao remover item do carrinho')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

// Esvaziar carrinho de compras
const emptyCart = async (customerId) => {
    let connection = null

    try {
        connection = await dbPool.getConnection()

        const sql = 'DELETE FROM cart WHERE customer_id = ?'
        await connection.execute(sql, [customerId])

    } catch (error) {
        console.log(error)
        throw new Error('Erro ao esvaziar o carrinho')
    } finally {
        if (connection) {
            connection.release()
        }
    }
}
module.exports = {
    addItemToCart,
    removeItemFromCart,
    updateCartItem,
    emptyCart,
    getAllCartItems,
    getCartItemById
}
