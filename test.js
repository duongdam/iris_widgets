const fs = require("fs");

const areas = [
    {
        name: "Basic Powertrain",
        bizLines: [
            "Engine System",
            "Fuel System",
            "Cooling System",
            "Lubrication",
            "Emission Control"
        ]
    },
    {
        name: "Advanced Electronics",
        bizLines: [
            "ECU",
            "Sensors",
            "Communication",
            "ADAS",
            "Diagnostics"
        ]
    },
    {
        name: "Vehicle Integration",
        bizLines: [
            "Chassis",
            "Interior",
            "Exterior",
            "Safety",
            "Testing"
        ]
    }
];

const commonFields = {
    hasTuning: false,
    hasManual: false,
    hasCert: false,
    hasRF: false,
    canEdit: false,
    metadata1: "metadata1",
    metadata2: "metadata2",
    metadata3: "metadata3",
    metadata4: "metadata4",
    metadata5: "metadata5"
};

const taskTemplates = [
    {
        name: "VOLUMN_WBT #1",
        startdate: "2024-11-30 15:00:00",
        endDate: "2026-03-31 15:00:00",
        milestone: "MTO",
        stndMileMonth: "2025-04-15 15:00:00",
        hasTuning: false,
        hasManual: false
    },
    {
        name: "VOLUMN_WBT #2",
        startdate: "2024-12-31 15:00:00",
        endDate: "2025-01-31 15:00:00",
        milestone: "K/O",
        stndMileMonth: "2025-12-31 15:00:00",
        hasTuning: false,
        hasManual: true
    },
    {
        name: "VOLUMN_WBT #3",
        startdate: "2024-11-30 15:00:00",
        endDate: "2026-03-31 15:00:00",
        milestone: "MTO",
        stndMileMonth: "2025-04-15 15:00:00",
        hasTuning: true,
        hasManual: true
    }
];

const subTaskTemplates = [
    {
        name: "Design Review",
        startdate: "2024-12-01 15:00:00",
        endDate: "2025-01-15 15:00:00",
        milestone: "K/O",
        stndMileMonth: "2025-01-01 15:00:00"
    },
    {
        name: "Prototype Build",
        startdate: "2025-01-16 15:00:00",
        endDate: "2025-03-15 15:00:00",
        milestone: "MTO",
        stndMileMonth: "2025-02-15 15:00:00"
    },
    {
        name: "Validation",
        startdate: "2025-03-16 15:00:00",
        endDate: "2025-05-31 15:00:00",
        milestone: "MTO",
        stndMileMonth: "2025-04-15 15:00:00"
    }
];

const result = [];

let areaCounter = 1;
let bizCounter = 1;
let taskCounter = 1;
let subTaskCounter = 1;

areas.forEach(area => {
    const areaId = `A${String(areaCounter).padStart(3, "0")}`;

    result.push({
        id: areaId,
        type: "AREA",
        name: area.name,
        text: area.name,
        parent: null,
        order: areaCounter,
        customOrder: 999999999,
        ...commonFields
    });

    area.bizLines.forEach(bizName => {
        const bizId = `B${String(bizCounter).padStart(3, "0")}`;

        result.push({
            id: bizId,
            type: "BIZ_LINE",
            name: bizName,
            text: bizName,
            parent: areaId,
            order: bizCounter + 1000,
            customOrder: 999999999,
            ...commonFields
        });

        taskTemplates.forEach(taskTemplate => {
            const taskId = `T${String(taskCounter).padStart(4, "0")}`;

            result.push({
                id: taskId,
                parent: bizId,
                type: "TASK",
                name: taskTemplate.name,
                text: taskTemplate.name,
                count: 0,
                order: taskCounter + 100000,
                customOrder: 999999999,

                startdate: taskTemplate.startdate,
                endDate: taskTemplate.endDate,
                milestone: taskTemplate.milestone,
                stndMileMonth: taskTemplate.stndMileMonth,

                hasTuning: taskTemplate.hasTuning,
                hasManual: taskTemplate.hasManual,
                hasCert: false,
                hasRF: false,
                canEdit: false,

                metadata1: "metadata1",
                metadata2: "metadata2",
                metadata3: "metadata3",
                metadata4: "metadata4",
                metadata5: "metadata5"
            });

            subTaskTemplates.forEach((subTemplate, index) => {
                const subTaskId = `ST${String(subTaskCounter).padStart(5, "0")}`;

                result.push({
                    id: subTaskId,
                    parent: taskId,
                    type: "SUB_TASK",
                    name: subTemplate.name,
                    text: subTemplate.name,
                    count: 0,
                    order: subTaskCounter + 1000000,
                    customOrder: 999999999,

                    startdate: subTemplate.startdate,
                    endDate: subTemplate.endDate,
                    milestone: subTemplate.milestone,
                    stndMileMonth: subTemplate.stndMileMonth,

                    hasTuning: index > 0,
                    hasManual: index !== 1,
                    hasCert: index === 2,
                    hasRF: false,
                    canEdit: false,

                    metadata1: "metadata1",
                    metadata2: "metadata2",
                    metadata3: "metadata3",
                    metadata4: "metadata4",
                    metadata5: "metadata5"
                });

                subTaskCounter++;
            });

            taskCounter++;
        });

        bizCounter++;
    });

    areaCounter++;
});

fs.writeFileSync("gantt-test.json", JSON.stringify(result, null, 2));
console.log(result);
console.log(`Generated ${result.length} records`);