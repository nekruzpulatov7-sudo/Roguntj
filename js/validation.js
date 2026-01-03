export function validateNotEmpty(fields) {
    for (const [name, value] of Object.entries(fields)) {
        if (!value || value.trim() === '') {
            return `Поле "${name}" не может быть пустым`;
        }
    }
    return null;
}
