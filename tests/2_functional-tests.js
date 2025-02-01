const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
    let testIssueId;

    suite('POST /api/issues/{project}', function () {
        test('Create an issue with every field', function (done) {
            chai.request(server)
                .post('/api/issues/test-project')
                .send({
                    issue_title: 'Test Issue',
                    issue_text: 'This is a test issue',
                    created_by: 'Tester',
                    assigned_to: 'Dev',
                    status_text: 'In Progress',
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body);
                    assert.property(res.body, '_id');
                    assert.property(res.body, 'created_on');
                    assert.property(res.body, 'updated_on');
                    assert.propertyVal(res.body, 'issue_title', 'Test Issue');
                    testIssueId = res.body._id; // 存储 id 供后续测试
                    done();
                });
        });

        test('Create an issue with only required fields', function (done) {
            chai.request(server)
                .post('/api/issues/test-project')
                .send({
                    issue_title: 'Required Fields Issue',
                    issue_text: 'This issue has only required fields',
                    created_by: 'Tester',
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body);
                    assert.property(res.body, '_id');
                    assert.propertyVal(res.body, 'open', true);
                    done();
                });
        });

        test('Create an issue with missing required fields', function (done) {
            chai.request(server)
                .post('/api/issues/test-project')
                .send({ issue_title: 'Required Fields Issue' })
                .end(function (err, res) {
                    assert.equal(res.status, 400); // 假设你的 API 返回 400
                    assert.isObject(res.body);
                    assert.property(res.body, 'error');
                    assert.propertyVal(res.body, 'error', 'required field(s) missing');
                    done();
                });
        });
    });

    suite('GET /api/issues/{project}', function () {
        test('View issues on a project', function (done) {
            chai.request(server)
                .get('/api/issues/test-project')
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    done();
                });
        });

        test('View issues with one filter', function (done) {
            chai.request(server)
                .get('/api/issues/test-project?created_by=Tester')
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    res.body.forEach((issue) => {
                        assert.propertyVal(issue, 'created_by', 'Tester');
                    });
                    done();
                });
        });

        test('View issues with multiple filters', function (done) {
            chai.request(server)
                .get('/api/issues/test-project?created_by=Tester&open=true')
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    res.body.forEach((issue) => {
                        assert.propertyVal(issue, 'created_by', 'Tester');
                        assert.propertyVal(issue, 'open', true);
                    });
                    done();
                });
        });
    });

    suite('PUT /api/issues/{project}', function () {
        test('Update one field on an issue', function (done) {
            chai.request(server)
                .put('/api/issues/test-project')
                .send({ _id: testIssueId, issue_title: 'Updated Title' })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.propertyVal(res.body, 'result', 'successfully updated');
                    done();
                });
        });

        test('Update multiple fields on an issue', function (done) {
            chai.request(server)
                .put('/api/issues/test-project')
                .send({ _id: testIssueId, issue_title: 'Multi Update', open: false })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.propertyVal(res.body, 'result', 'successfully updated');
                    done();
                });
        });

        test('Update an issue with missing _id', function (done) {
            chai.request(server)
                .put('/api/issues/test-project')
                .send({ issue_title: 'No ID' })
                .end(function (err, res) {
                    assert.equal(res.status, 400);
                    assert.property(res.body, 'error');
                    done();
                });
        });
    });

    suite('DELETE /api/issues/{project}', function () {
        test('Delete an issue', function (done) {
            chai.request(server)
                .delete('/api/issues/test-project')
                .send({ _id: testIssueId })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.propertyVal(res.body, 'result', 'successfully deleted');
                    done();
                });
        });

        test('Delete an issue with an invalid _id', function (done) {
            chai.request(server)
                .delete('/api/issues/test-project')
                .send({ _id: 'invalidID' })
                .end(function (err, res) {
                    assert.equal(res.status, 400);
                    assert.property(res.body, 'error');
                    done();
                });
        });

        test('Delete an issue with missing _id', function (done) {
            chai.request(server)
                .delete('/api/issues/test-project')
                .send({})
                .end(function (err, res) {
                    assert.equal(res.status, 400);
                    assert.property(res.body, 'error');
                    done();
                });
        });
    });
});

