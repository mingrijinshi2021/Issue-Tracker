'use strict';

let issues = []; // 用数组存储 issues
issues.push({
    _id: '1',
    project: 'project1',
    issue_title: 'issue1',
    issue_text: 'issue1 text',
    created_by: 'user1',
    assigned_to: 'user2',
    open: true,
    status_text: 'open',
    created_on: new Date(),
    updated_on: new Date(),
});

module.exports = function (app) {
    app.route('/api/issues/:project')

        // **GET 获取 issue 列表**
        .get(function (req, res) {
            let project = req.params.project;
            let filter = { project: project };

            // 遍历查询参数，动态构建过滤条件
            for (let key in req.query) {
                if (req.query.hasOwnProperty(key)) {
                    filter[key] = req.query[key];
                }
            }

            // 过滤符合条件的 issue
            let result = issues.filter((issue) => Object.keys(filter).every((key) => issue[key] === filter[key]));

            // 返回符合条件的所有字段信息
            res.json(result);
        })

        // **POST 创建新的 issue**
        .post(function (req, res) {
            let project = req.params.project;
            let { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

            if (!issue_title || !issue_text || !created_by) {
                return res.json({ error: 'required field(s) missing' });
            }

            let newIssue = {
                _id: new Date().getTime().toString(), // 生成唯一 ID
                project,
                issue_title,
                issue_text,
                created_by,
                assigned_to: assigned_to || '',
                open: true,
                status_text: status_text || '',
                created_on: new Date(),
                updated_on: new Date(),
            };

            issues.push(newIssue);
            res.json(newIssue);
        })

        // **PUT 更新 issue**
        .put(function (req, res) {
            let { _id, issue_title, issue_text, created_by, assigned_to, open, status_text } = req.body;

            if (!_id) {
                return res.json({ error: 'missing _id' });
            }

            let issue = issues.find((i) => i._id === _id);
            if (!issue) {
                return res.json({ error: 'could not update', _id: _id });
            }
            // 如果什么更新字段都不包含,就报错
            if (!issue_title && !issue_text && !created_by && !assigned_to && !status_text && !open) {
                return res.json({ error: 'no update field(s) sent', _id: _id });
            }

            // 更新字段
            if (issue_title) issue.issue_title = issue_title;
            if (issue_text) issue.issue_text = issue_text;
            if (created_by) issue.created_by = created_by;
            if (assigned_to) issue.assigned_to = assigned_to;
            if (status_text) issue.status_text = status_text;
            if (open !== undefined) issue.open = open;
            issue.updated_on = new Date();

            res.json({ result: 'successfully updated', _id: _id });
        })

        // **DELETE 删除 issue**
        .delete(function (req, res) {
            let { _id } = req.body;

            if (!_id) {
                return res.json({ error: 'missing _id' });
            }

            let index = issues.findIndex((i) => i._id === _id);
            if (index === -1) {
                return res.json({ error: 'could not delete', _id: _id });
            }

            issues.splice(index, 1);
            res.json({ result: 'successfully deleted', _id: _id });
        });
};

