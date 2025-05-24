const request = require('supertest');
const app = require('../src/app'); // tu app Express

describe('Calendario API', () => {
  let createdEventId;

  it('debería crear un evento', async () => {
    const res = await request(app)
      .post('/calendario')
      .send({
        tutorId: '1234abcd-5678-efgh-ijkl-9012mnopqrst',
        fecha: '2025-06-01',
        horaInicio: '10:00',
        horaFin: '11:00',
        descripcion: 'Prueba evento',
      });
    createdEventId = res.body._id;
    expect(res.statusCode).to.equal(201);
    expect(res.body).to.have.property('_id');
  });

  it('debería obtener eventos por tutor', async () => {
    const res = await request(app)
      .get('/calendario/tutor/1234abcd-5678-efgh-ijkl-9012mnopqrst');
    expect(res.statusCode).to.equal(200);
    expect(res.body).to.be.an('array');
  });

  it('debería actualizar estado del evento', async () => {
    const res = await request(app)
      .patch(`/calendario/${createdEventId}/estado`)
      .send({ estado: 'confirmada' });
    expect(res.statusCode).to.equal(200);
    expect(res.body.estado).to.equal('confirmada');
  });

  it('debería eliminar el evento', async () => {
    const res = await request(app)
      .delete(`/calendario/${createdEventId}`);
    expect(res.statusCode).to.equal(204);
  });
});
