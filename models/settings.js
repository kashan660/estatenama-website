const { pool } = require('../db');

async function getAllSettings() {
    const [rows] = await pool.execute('SELECT setting_key, setting_value FROM settings');
    const settings = {};
    rows.forEach(row => {
        settings[row.setting_key] = row.setting_value;
    });
    return settings;
}

async function getSetting(key) {
    const [rows] = await pool.execute('SELECT setting_value FROM settings WHERE setting_key = ?', [key]);
    return rows[0]?.setting_value || null;
}

async function updateSetting(key, value) {
    await pool.execute(
        `INSERT INTO settings (setting_key, setting_value)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [key, value]
    );
    return { key, value };
}

async function updateMultipleSettings(settingsObj) {
    for (const [key, value] of Object.entries(settingsObj)) {
        await updateSetting(key, value);
    }
    return getAllSettings();
}

module.exports = {
    getAllSettings,
    getSetting,
    updateSetting,
    updateMultipleSettings
};
