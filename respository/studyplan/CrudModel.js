
const mysql = require("mysql");
const config = require('../../dbconfig.js');

var connection = mysql.createPool({
    host: config.local.host,
    user: config.local.user,
    password: config.local.password,
    database: config.local.database,
});


function SelectAll(table) {
    // var Query = `SELECT * FROM ${table} WHERE is_deleted IS NULL LIMIT ${size} OFFSET ${skip}`
    var Query = `SELECT * FROM ${table} WHERE is_deleted IS NULL `
    return Query
}
function SelectById(table, column_id, id) {
    var Query = `SELECT * FROM ${table} WHERE ${column_id} = ${id} AND is_deleted IS NULL`
    return Query
}
function Create(table) {
    var Query = `INSERT INTO ${table} SET ?`
    return Query
}

// 
function DuplicateSubjects(curriculum_id, newcurriculumn_id) {
    let talble = "subjects_test"
    var Query = `INSERT INTO ${talble} (curriculum_id,group_type_id,subject_code,subject_name_th,subject_name_en,credit_qty,subject_description) SELECT CASE curriculum_id WHEN ${curriculum_id} THEN ${newcurriculumn_id} ELSE null END curriculum_id,group_type_id,subject_code,subject_name_th,subject_name_en,credit_qty,subject_description FROM subjects WHERE is_deleted IS NULL AND curriculum_id = ${curriculum_id}`
    return Query
}


function UpdateById(table, column_id, id) {
    var Query = `UPDATE ${table} SET ? WHERE ${column_id} = ${id}`
    return Query
}

function Delete(table, column_id, id) {
    var Query = `UPDATE ${table} SET is_deleted = 1 WHERE ${column_id} = ${id}`
    return Query
}


module.exports = { SelectAll, SelectById, Create, UpdateById, Delete, DuplicateSubjects }
