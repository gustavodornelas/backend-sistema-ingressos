const media = require('../models/Media')
const dbPool = require('../config/dbPool');
const Media = require('../models/Media');
const NotFoundError = require('../CustomErrors/NotFoundError');

const saveMedia = async (newMedia) => {
    let connection = null;

    try {
        connection = await dbPool.getConnection();

        const MediaInsert = 'INSERT INTO media (name_media, path_media, event_id, type) VALUES (?, ?, ?, ?)';
        const [result] = await connection.execute(MediaInsert, [
            newMedia.nameMedia,
            newMedia.pathMedia,
            newMedia.eventId,
            newMedia.type,
        ]);

        const mediaSelect = "SELECT * FROM media WHERE id = ?"
        const [rows] = await connection.execute(mediaSelect, [result.insertId])


        if (rows.lengh === 0) {
            throw new NotFoundError("Não foram encontradas midias para o evento")
        }

        const row = rows[0]
        const media = new Media(
            row.id,
            row.path_name,
            row.path_media,
            row.event_id,
            row.type,
            row.created_at
        )

        return { media };
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao salvar mídia');
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

const getEventMedia = async (id) => {

    let connection = null

    try {
        connection = await dbPool.getConnection()

        const mediaSelect = "SELECT * FROM media WHERE event_id = ?"
        const [rows] = await connection.execute(mediaSelect, [id])


        if (rows.lengh === 0) {
            throw new NotFoundError("Não foram encontradas midias para o evento")
        }

        const medias = rows.map(row => 
            new Media(
                row.id,
                row.path_name,
                row.path_media,
                row.event_id,
                row.type,
                row.created_at
            )
        )

        return { medias }

    } catch (error) {
        console.error(error)
    } finally {
        if (connection) {
            connection.release()
        }
    }

}

module.exports = { saveMedia, getEventMedia };