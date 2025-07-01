import db from '../models/index.js';

/**
 * @swagger
 * tags:
 *   - name: Teachers
 *     description: Teacher management
 */

/**
 * @swagger
 * /teachers:
 *   post:
 *     summary: Create a new teacher
 *     tags: [Teachers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, department]
 *             properties:
 *               name:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       201:
 *         description: Teacher created
 */
export const createTeacher = async (req, res) => {
    try {
        const teacher = await db.Teacher.create(req.body);
        res.status(201).json(teacher);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /teachers:
 *   get:
 *     summary: Get all teachers
 *     tags: [Teachers]
 *     parameters:
 * 
 *       # Pagination parameter
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number (used for pagination)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of teachers per page

 *       # Sorting paprameter 
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort by creation date (ascending or descending)

 *       # Eager loading (populate) parameter 
 *       - in: query
 *         name: populate
 *         schema:
 *           type: string
 *           example: courses,students
 *         description: Comma-separated list of related models to include in the response
 *     responses:
 *       200:
 *         description: List of teachers
 */

export const getAllTeachers = async (req, res) => {

    // == 1. Pagination ==
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    // == 2. Sorting ==
    const sort = req.query.sort === 'desc' ? 'DESC': 'ASC';

    // == 3. Eager Loading (Populate)
    const populate = req.query.populate?.split(',') || [];

    // Build the list of models to include in the query
    const includeModels = [];
    if (populate.includes('students')) includeModels.push(db.Student);
    if (populate.includes('courses')) includeModels.push(db.Course);

    try {

        // Get total count of courses for pagination metadata
        const total = await db.Teacher.count();

        const teachers = await db.Teacher.findAll({
            limit,
            offset: (page - 1) * limit,
            order: [['createdAt', sort]],
            include: includeModels,
        });

        res.json({
            total,
            page,
            totalPages: Math.ceil(total / limit),
            data: teachers,
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /teachers/{id}:
 *   get:
 *     summary: Get a teacher by ID
 *     tags: [Teachers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Teacher found
 *       404:
 *         description: Not found
 */
export const getTeacherById = async (req, res) => {
    try {
        const teacher = await db.Teacher.findByPk(req.params.id, { include: [db.Course, db.Student] });
        if (!teacher) return res.status(404).json({ message: 'Not found' });
        res.json(teacher);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /teachers/{id}:
 *   put:
 *     summary: Update a teacher
 *     tags: [Teachers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 */
export const updateTeacher = async (req, res) => {
    try {
        const teacher = await db.Teacher.findByPk(req.params.id);
        if (!teacher) return res.status(404).json({ message: 'Not found' });
        await teacher.update(req.body);
        res.json(teacher);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /teachers/{id}:
 *   delete:
 *     summary: Delete a teacher
 *     tags: [Teachers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted
 */
export const deleteTeacher = async (req, res) => {
    try {
        const teacher = await db.Teacher.findByPk(req.params.id);
        if (!teacher) return res.status(404).json({ message: 'Not found' });
        await teacher.destroy();
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
