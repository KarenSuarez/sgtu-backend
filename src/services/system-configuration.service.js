// src/services/system-configuration.service.js
const SystemConfiguration = require('../models/mongo/system-configuration.model');

class SystemConfigurationService {
    constructor() {
        if (SystemConfigurationService.instance) {
            return SystemConfigurationService.instance;
        }
        this.configurations = {}; // Almacenará las configuraciones en memoria
        SystemConfigurationService.instance = this;
    }

    static getInstance() {
        if (!SystemConfigurationService.instance) {
            SystemConfigurationService.instance = new SystemConfigurationService();
        }
        return SystemConfigurationService.instance;
    }

    async loadConfigurations() {
        try {
            const configs = await SystemConfiguration.find({});
            configs.forEach(config => {
                this.configurations[config.key] = config.value;
            });
            console.log('Configuraciones del sistema cargadas.');
        } catch (error) {
            console.error('Error al cargar configuraciones del sistema:', error.message);
            // Cargar valores por defecto si falla la DB
            this.configurations = {
                maxTutoringDurationMinutes: 120, // Ejemplo
                emailNotificationsEnabled: true
            };
        }
    }

    getConfiguration(key) {
        return this.configurations[key];
    }

    async setConfiguration(key, value, description = '') {
        await SystemConfiguration.findOneAndUpdate(
            { key },
            { value, description },
            { upsert: true, new: true } // Crea si no existe, devuelve el nuevo documento
        );
        this.configurations[key] = value; // Actualiza en memoria
        console.log(`Configuración '${key}' actualizada.`);
        return { key, value };
    }
}

module.exports = SystemConfigurationService;