'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
const isStar = true;

function parseAllNamespaces(event) {
    const namespaces = [event];
    let currentIndex = event.length;
    while ((currentIndex = event.lastIndexOf('.', currentIndex - 1)) >= 0) {
        namespaces.push(event.substring(0, currentIndex));
    }

    return namespaces;
}

function executeEvent(eventInfo, context) {
    const { handler, times, frequency, callsCount } = eventInfo;
    if (callsCount < times && (frequency === 0 || callsCount % frequency === 0)) {
        handler.call(context);
    }
    eventInfo.callsCount++;
}

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    const events = new Map();

    return {

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Object} eventInfo
         * @returns {Object}
         */
        on: function (event, context, handler, eventInfo = { times: Infinity, frequency: 0 }) {
            if (!events.has(event)) {
                events.set(event, new Map());
            }
            const namespaceEvents = events.get(event);
            if (!namespaceEvents.has(context)) {
                namespaceEvents.set(context, []);
            }
            const contextEvents = namespaceEvents.get(context);
            const { times, frequency } = eventInfo;
            contextEvents.push({
                handler,
                times,
                frequency,
                callsCount: 0
            });

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {Object}
         */
        off: function (event, context) {
            for (let namespace of events.keys()) {
                if (namespace === event || namespace.startsWith(event + '.')) {
                    events.get(namespace).delete(context);
                }
            }

            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object}
         */
        emit: function (event) {
            parseAllNamespaces(event)
                .filter(namespace => events.has(namespace))
                .forEach(namespace => {
                    events.get(namespace)
                        .forEach((contextEvents, context) =>
                            contextEvents.forEach(contextEvent =>
                                executeEvent(contextEvent, context))
                        );
                });

            return this;
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         * @returns {Object}
         */
        several: function (event, context, handler, times) {
            times = times <= 0 ? Infinity : times;
            this.on(event, context, handler, { times, frequency: 0 });

            return this;
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} frequency – как часто уведомлять
         * @returns {Object}
         */
        through: function (event, context, handler, frequency) {
            frequency = frequency <= 0 ? 0 : frequency;
            this.on(event, context, handler, { times: Infinity, frequency });

            return this;
        }
    };
}

module.exports = {
    getEmitter,
    isStar
};
