import React, { Component } from 'react';
import { AsyncStorage, Alert, Platform, Dimensions, TextInput, Modal } from 'react-native';
import { Button, Container, Content, List, ListItem, Text, Fab, Icon, Form, Item, Label, Input, Header, Picker, View, Left, Body, Title, Right, Footer } from 'native-base';
import Swipeout from "react-native-swipeout";
import email from 'react-native-email'
import { moderateScale } from "./scale"


const EMAIL = "Kalkulacka:Email";

export default class HomeScreen extends Component {
  state = {
    listItems: [],
    setting: [
      { Name: "Smrk", p0: 0.57723, p1: 0.006897, p2: 1.3122 },
      { Name: "Borovice", p0: 0.24017, p1: 0.001915, p2: 1.7866 },
      { Name: "Borovice borka, Modřín", p0: 1.7015, p1: 0.008762, p2: 1.4568 },
      { Name: "Buk", p0: -0.04088, p1: 0.16634, p2: 0.56076 },
      { Name: "Dub", p0: 1.2474, p1: 0.042323, p2: 1.0623 },
      { Name: "Bez kůry", p0: 0, p1: 0, p2: 0 },
    ],
    modalVisible: false,
    modalShare: false,
    prumer: "",
    delka: "",
    kura: 0,
    mail: ""
  }

  componentDidMount() {
    this.getEmail();
  }

  async getEmail() {
    try {
      var value = await AsyncStorage.getItem(EMAIL);
      this.setState({
        mail: value ? value : ""
      });
    } catch (error) {
    }
  }

  async setMail() {
    try {
      await AsyncStorage.setItem(EMAIL, this.state.mail);
    } catch (e) {
    }
  }

  vypocetCelkem() {
    var celkem = 0;
    this.state.listItems.forEach(item => {
      celkem = celkem + parseFloat(item.vysledek);
    });

    return celkem.toFixed(2);
  }

  vypocet() {
    if (this.state.prumer == "" || this.state.delka == "") {
      return "0.00";
    }

    var k = this.state.setting[this.state.kura].p0 + (this.state.setting[this.state.kura].p1 * Math.pow(parseFloat(this.state.prumer), this.state.setting[this.state.kura].p2));

    return ((Math.PI / 4) * Math.pow((parseFloat(this.state.prumer) - k), 2) * parseFloat(this.state.delka) * 0.0001).toFixed(2);
  }

  handlePridat() {
    if (this.state.prumer == "" || this.state.delka == "") {
      return;
    }

    let item = {
      prumer: this.state.prumer,
      delka: this.state.delka,
      kura: this.state.setting[this.state.kura].Name,
      vysledek: this.vypocet(),
    }
    let items = this.state.listItems;
    items.push(item);
    this.setState({
      listItems: items
    });

    this.handleZrusit();
  }

  handleZrusit() {
    this.setState({
      prumer: "",
      delka: "",
      kura: 0,
      modalVisible: false
    })
  }

  handleSmazat(index) {
    var items = this.state.listItems;
    items.splice(index, 1);
    this.setState({
      listItems: items
    });
  }

  ziskejTextBody() {
    let body = "";

    this.state.listItems.forEach(item => {
      body += "Průměr: " + item.prumer + "cm , Délka: " + item.delka + "m, Kura: " + this.state.setting[this.state.kura].Name + ", Vypočet: " + item.vysledek + "m3 \n";
    });

    body += "\n Celkem: " + this.vypocetCelkem() + "m3";

    return body;
  }

  ziskejTextPredmet() {
    const to = [this.state.mail] // string or array of email addresses
    let today = new Date();
    let den = today.getDate();
    let mesic = today.getMonth() + 1;
    let rok = today.getFullYear();
    let hod = today.getHours();
    let min = today.getMinutes();
    if (min < 10) {
      min = "0" + min
    }
    let formatovanyDatum = den + ". " + mesic + ". " + rok + " " + hod + ":" + min;

    return 'Kubírovací výpočty z ' + formatovanyDatum
  }

  handleShare() {
    if (this.state.listItems.length == 0 || this.state.mail == "") {
      return;
    }

    this.setMail();

    email(this.state.mail, {
      subject: this.ziskejTextPredmet(),
      body: this.ziskejTextBody()
    }).catch(Alert.alert("Nenalezen klient", "Naistalujte si emailového klienta"));
  }

  handleShareClose() {
    this.setState({
      modalShare: false
    })
  }

  renderRow(item, rowId) {
    return (
      <Swipeout
        key={rowId}
        right={[{
          text: "Smazat",
          type: "delete",
          underlayColor: "#f6322d",
          onPress: () => this.handleSmazat(rowId)
        }]} style={{ backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#c9c9c9" }}>
        <ListItem style={{ borderBottomWidth: 0 }}>
          <View>
            <Text style={{ fontSize: moderateScale(20) }}>{item.kura}</Text>
            <Text style={{ color: "#575757" }}>Průměr: {item.prumer} cm </Text>
            <Text style={{ color: "#575757" }}>Délka: {item.delka} m</Text>
          </View>
          <View style={{ flex: 1, flexDirection: "row", alignItems: 'flex-end', justifyContent: "flex-end" }}>
            <Text style={{ fontSize: moderateScale(30) }}>{item.vysledek}</Text>
            <View style={{ paddingBottom: 5, flexDirection: 'row', alignItems: 'flex-start' }}>
              <Text style={{ lineHeight: moderateScale(20), color: "#575757" }}>m</Text>
              <Text style={{ fontSize: moderateScale(7), lineHeight: moderateScale(12), color: "#575757" }}>3</Text>
            </View>
          </View>
        </ListItem>
      </Swipeout>
    );
  }

  render() {
    return (
      <Container>
        <Header>
          <Left>
          </Left>
          <Body>
            <Title></Title>
          </Body>
          <Right>
            <Button onPress={() => this.setState({ modalShare: this.state.listItems.length > 0 })} transparent>
              <Icon name="share" />
            </Button>
          </Right>
        </Header>
        <Content>
          {this.state.listItems == 0 ? <View style={{ backgroundColor: "white", padding: 20, alignItems: "center" }}><Text style={{ textAlign: "center" }}>Pomocí tlačítka plus přidejte Váš první výpočet. Poté bude moci seznam výpočtů posílat přes email.</Text></View> : null}
          <List>
            {this.state.listItems.map((item, index) => this.renderRow(item, index))}
          </List>
        </Content>
        <Footer style={{ alignItems: "flex-end", paddingBottom: 10 }}>
          <Text style={{ color: Platform.select({ ios: "#575757", android: "#bbbbbb" }) }}>Celkem: </Text>
          <Text style={{ fontSize: moderateScale(30), color: Platform.select({ ios: "black", android: "white" }) }}>{this.vypocetCelkem()}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Text style={{ lineHeight: moderateScale(20), color: Platform.select({ ios: "#575757", android: "#bbbbbb" }) }}>m</Text>
            <Text style={{ fontSize: moderateScale(7), lineHeight: moderateScale(12), color: Platform.select({ ios: "#575757", android: "#bbbbbb" }) }}>3</Text>
          </View>
        </Footer>
        <Modal
          onRequestClose={() => this.handleZrusit()}
          visible={this.state.modalVisible}
          animationType="slide"
        >
          <Container>
            <Header>
              <Left>
                <Button onPress={() => this.handleZrusit()} transparent>
                  <Text>Zrušit</Text>
                </Button>
              </Left>
              <Right>
                <Button onPress={() => this.handlePridat()} transparent>
                  <Text>Přidat</Text>
                </Button>
              </Right>
            </Header>
            <Content>
              <Form>
                <Item stackedLabel style={{ alignItems: "flex-start" }}>
                  <Label>Dřevina</Label>
                  <Picker
                    iosHeader="Vyberte typ kůry"
                    mode="dropdown"
                    selectedValue={this.state.kura}
                    headerBackButtonText="Zpět"
                    onValueChange={(kura) => this.setState({ kura })}
                    textStyle={{ paddingLeft: 0, flex: 1 }}
                    style={{ width: Dimensions.get('window').width - 30 }}
                  >
                    {this.state.setting.map((item, i) => <Item label={item.Name} value={i} key={i} />)}
                  </Picker>
                </Item>
                <Item
                  stackedLabel
                  success={this.state.delka != ""}
                  error={this.state.delka == ""}>
                  <Label>Délka (m)</Label>
                  <Input
                    keyboardType="numeric"
                    onChangeText={(delka) => this.setState({ delka })}
                    value={this.state.delka}
                    returnKeyType="done"
                  />
                  {this.state.delka == "" ?
                    <Icon name='close-circle' /> :
                    <Icon name='checkmark-circle' />
                  }
                </Item>
                <Item
                  stackedLabel
                  last
                  success={this.state.prumer != ""}
                  error={this.state.prumer == ""}>
                  <Label>Průměr (cm)</Label>
                  <Input
                    keyboardType="numeric"
                    onChangeText={(prumer) => this.setState({ prumer })}
                    value={this.state.prumer}
                    returnKeyType="done"
                  />
                  {this.state.prumer == "" ?
                    <Icon name='close-circle' /> :
                    <Icon name='checkmark-circle' />
                  }
                </Item>
              </Form>
              <Footer style={{ alignItems: "flex-end", paddingBottom: 10, borderTopWidth: 0, backgroundColor: "white", height: moderateScale(70) }}>
                <Text style={{ fontSize: moderateScale(30) }}>{this.vypocet()}</Text>
                <View style={{ paddingBottom: 5, flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Text style={{ lineHeight: moderateScale(20), color: "#575757" }}>m</Text>
                  <Text style={{ fontSize: moderateScale(7), lineHeight: moderateScale(12), color: "#575757" }}>3</Text>
                </View>
              </Footer>
            </Content>
          </Container>
        </Modal>
        <Modal
          animationType="slide"
          onRequestClose={() => this.handleShareClose()}
          visible={this.state.modalShare}
        >
          <Container>
            <Header>
              <Left>
                <Button onPress={() => this.handleShareClose()} transparent>
                  <Text>Zrušit</Text>
                </Button>
              </Left>
              <Right>
                <Button onPress={() => this.handleShare()} transparent>
                  <Text>Odeslat</Text>
                </Button>
              </Right>
            </Header>
            <Content>
              <Form style={{ paddingBottom: 10 }}>
                <Item
                  stackedLabel
                  last
                  success={this.state.mail != ""}
                  error={this.state.mail == ""}
                >
                  <Label>Email</Label>
                  <Input
                    onChangeText={(mail) => this.setState({ mail })}
                    value={this.state.mail}
                    returnKeyType="done"
                  />
                  {this.state.mail == "" ?
                    <Icon name='close-circle' /> :
                    <Icon name='checkmark-circle' />
                  }
                </Item>
              </Form>
            </Content>
          </Container>
        </Modal>
        <Fab
          style={{ backgroundColor: 'green' }}
          position="bottomRight"
          onPress={() => this.setState({ modalVisible: true })}
        >
          <Icon name="add" />
        </Fab>
      </Container>
    );
  }
}