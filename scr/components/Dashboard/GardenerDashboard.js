import React from "react";
import { Container, Tabs, Tab, Row, Col, Table, Button } from "react-bootstrap";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../../utils/FirebaseLink";
import { collection, deleteDoc } from "firebase/firestore";
import { doc as fDoc, setDoc, Timestamp, addDoc, arrayUnion, increment } from "firebase/firestore";
import { toast } from "react-toastify";

const PlantSeeds = ({ user }) => {
  const [seeds] = useCollection(collection(db, "Seeds"));
  const [seedsToPlant] = useCollection(collection(db, "SeedsToPlant"));

  const getHarvestWaitTime = (seedName) => {
    const seed = seeds.docs.find((doc) => doc.id === seedName);
    console.log(seed.data().harvestWaitTime);
    return seed.data().harvestWaitTime;
  };

  const addDays = (date, days) => {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const handleSeedsPlant = async (doc) => {
    const plantDateTimestamp = Timestamp.fromDate(new Date(Date.now()));
    const timeTillHarvest = addDays(plantDateTimestamp.toDate(), getHarvestWaitTime(doc.data().seedName));

    const plantedSeedsDoc = {
      seedName: doc.data().seedName,
      datePlanted: Timestamp.fromDate(new Date(Date.now())),
      harvestableDate: Timestamp.fromDate(new Date(timeTillHarvest)),
      amount: doc.data().amount,
      accountID: user.uid,
      accountEmail: user.email,
    };

    console.table(plantedSeedsDoc);
    await addDoc(collection(db, "PlantedSeeds"), plantedSeedsDoc).then(async () => {
      await setDoc(
        fDoc(db, "SeedStats", doc.data().seedName),
        {
          totalAmountPlanted: increment(doc.data().amount),
          detailedStats: arrayUnion({
            stat: "Plant",
            amount: doc.data().amount,
            date: Timestamp.fromDate(new Date(Date.now())),
          }),
        },
        { merge: true }
      )
        .then(async () => {
          await setDoc(
            fDoc(db, "AccountDetails", user.uid),
            {
              gardenerStats: arrayUnion({
                activity: "Plant",
                amount: doc.data().amount,
                date: Timestamp.fromDate(new Date(Date.now())),
                seedName: doc.data().seedName,
              }),
            },
            { merge: true }
          );
        })
        .then(() => {
          toast.success("Seed plant confirmed!");
        })
        .catch((error) => {
          toast.error(error.message);
        });
    });

    await deleteDoc(fDoc(db, "SeedsToPlant", doc.id)).then(() => {
      console.log("Seed deleted from SeedsToPlant");
    });

    await addDoc(collection(db, "ConfirmPlant"), {
      email: user.email,
      seedPlanted: doc.data().seedName,
      amountPlanted: doc.data().amount,
    });
  };

  const showSeedsToPlant = (doc, index) => {
    return (
      <tr key={index}>
        <td>{index}</td>
        <td>{doc.data().seedName}</td>
        <td>{doc.data().amount}</td>
        <td style={{ textAlign: "center" }}>
          <Button
            variant="outline-light"
            onClick={() => {
              handleSeedsPlant(doc);
            }}
          >
            Plant & Confirm Seed is Planted
          </Button>
        </td>
      </tr>
    );
  };

  return (
    <Row>
      <Col>
        <h3>Seeds To Plant</h3>
        {seedsToPlant && seedsToPlant.docs.length === 0 ? (
          <p>No seeds to plant</p>
        ) : (
          <Table striped bordered hover variant="dark">
            <thead>
              <tr>
                <th>Batch #</th>
                <th>Seed Name</th>
                <th>Amount(Grams)</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {seedsToPlant &&
                seedsToPlant.docs.map((doc, index) => {
                  return showSeedsToPlant(doc, index);
                })}
            </tbody>
          </Table>
        )}
      </Col>
    </Row>
  );
};

const HarvestSeeds = ({ user }) => {
  const [plantedSeeds] = useCollection(collection(db, "PlantedSeeds"));

  const getDaysTillHarvestDate = (date) => {
    const daysTillHarvest = Math.ceil((date.toDate() - new Date(Date.now())) / (1000 * 60 * 60 * 24));
    return daysTillHarvest;
  };

  const handleHarvest = async (doc) => {
    const harvestedSeedDoc = {
      seedName: doc.data().seedName,
      dateOfHarvest: Timestamp.fromDate(new Date(Date.now())),
      amount: doc.data().amount,
      accountID: user.uid,
    };

    await addDoc(collection(db, "HarvestedSeeds"), harvestedSeedDoc).then(async () => {
      await setDoc(
        fDoc(db, "SeedStats", doc.data().seedName),
        {
          totalAmountHarvested: increment(doc.data().amount),
          detailedStats: arrayUnion({
            stat: "Harvest",
            amount: doc.data().amount,
            date: Timestamp.fromDate(new Date(Date.now())),
          }),
        },
        { merge: true }
      )
        .then(async () => {
          await setDoc(
            fDoc(db, "AccountDetails", user.uid),
            {
              gardenerStats: arrayUnion({
                activity: "Harvest",
                amount: doc.data().amount,
                date: Timestamp.fromDate(new Date(Date.now())),
                seedName: doc.data().seedName,
              }),
            },
            { merge: true }
          );
        })
        .then(() => {
          toast.success("Seed harvested!");
        })
        .catch((error) => {
          toast.error(error.message);
        });

      await deleteDoc(fDoc(db, "PlantedSeeds", doc.id)).then(() => {
        console.log("Seed deleted from PlantedSeeds");
      });
    });
  };

  const showPlantedSeeds = (doc, index) => {
    return (
      <tr key={index}>
        <td>{index}</td>
        <td>{doc.data().seedName}</td>
        <td>{doc.data().amount}</td>
        <td>{doc.data().harvestableDate.toDate().toDateString()}</td>
        <td style={{ textAlign: "center" }}>
          {getDaysTillHarvestDate(doc.data().harvestableDate) > 0 ? (
            <>
              {" "}
              <Button variant="outline-success" disabled style={{ color: "#246b24", fontWeight: "bold" }}>
                {getDaysTillHarvestDate(doc.data().harvestableDate)} day(s) remain
              </Button>
            </>
          ) : (
            <Button
              variant="success"
              onClick={() => {
                handleHarvest(doc);
              }}
            >
              Harvest & Confirm Harvest
            </Button>
          )}
        </td>
      </tr>
    );
  };

  return (
    <Row>
      <Col>
        <h3>Seeds To Harvest</h3>
        <p>All planted seeds are listed here. Only Seeds ready to be harvested can be confirmed for harvest!</p>
      </Col>

      <br />
      <Row>
        <Table striped bordered hover variant="dark">
          <thead>
            <tr>
              <th>Slot #</th>
              <th>Seed Name</th>
              <th>Amount(Grams)</th>
              <th>Date until Harvest</th>

              <th style={{ textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plantedSeeds &&
              plantedSeeds.docs.map((doc, index) => {
                return showPlantedSeeds(doc, index);
              })}
          </tbody>
        </Table>
      </Row>
    </Row>
  );
};

const GardenerDashboard = ({ displayName, user }) => {
  return (
    <Container>
      <Row>
        <Col>
          <h1>Hi, {displayName}!</h1>
        </Col>
      </Row>
      <br />

      <Col>
        <Tabs variant="pills" defaultActiveKey="plantSeeds" id="uncontrolled-tab-example" className="mb-3">
          <Tab eventKey="plantSeeds" title="Plant Seeds">
            <PlantSeeds user={user} />
          </Tab>
          <Tab eventKey="harvestSeeds" title="Harvest Seeds">
            <HarvestSeeds user={user} />
          </Tab>
        </Tabs>
      </Col>
    </Container>
  );
};

export default GardenerDashboard;
