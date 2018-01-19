import React from 'react';
import ReactDOM from 'react-dom';
import BusinessEntry from './BusinessEntry.jsx';
import { Link } from 'react-router-dom';

class BusinessList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      sortTypeToIgnore: null,
      entries: this.props.businesses.data,
      activeFilters: {
        price: false,
        rating: false,
        is_open: false,
        nearby: false,
        favorited: false
      }
    }

    this.sortByPrice = this.sortByPrice.bind(this)
    this.sortByRating = this.sortByRating.bind(this)
    this.sortByFavorited = this.sortByFavorited.bind(this)
    this.sortByOpen = this.sortByOpen.bind(this);
  }
  componentWillMount() {
    document.body.style.background = "url('wood.jpg')";
    document.body.style.backgroundSize = "100%";
    document.body.style.backgroundRepeat = "repeat-y";
  }

  sortByPrice(entriesToSort) {
    let pricedEntries = entriesToSort.filter(entry => entry.price_level);
    let sortedPricedEntries = pricedEntries.sort((a, b) => {
      return b.price_level - a.price_level
    })
    return sortedPricedEntries
  }

  sortByRating(entriesToSort) {
    let ratedEntries = entriesToSort.sort((a, b) => {
      return b.rating - a.rating 
    })
    return ratedEntries;
  }

  sortByFavorited(entriesToSort) {
    const favorites = this.props.favorites;
    let favoritedEntries = entriesToSort.filter(entry => {
      if (favorites[entry.id]){
       return entry
      }
    })
    return favoritedEntries;
  }

  sortPrioritizeRating(entriesToSort) {
    entriesToSort = entriesToSort.filter(entry => entry.rating && entry.price_level);
      let sorted = entriesToSort.sort((a, b) => {
        if (a.rating > b.rating) {
          return -1
        } else if (b.rating > a.rating) {
          return 1 
        } else if (b.rating == a.rating) {
          // console.log('even ', a.name, b.name, ' sorting by price')
          if (a.price_level > b.price_level) {
            return -1;
          } else if (b.price_level > a.price_level) {
            return 1;
          }
        }
      })
    return sorted;
  }

  sortPrioritizePrice(entriesToSort) {
    let sorted = entriesToSort.sort((a, b) => {
      if (a.price_level > b.price_level) {
        return -1
      } else if (b.price_level > a.price_level) {
        return 1 
      } else if (b.price_level == a.price_level) {
        // console.log('even ', a.name, b.name, ' sorting by rating')
        if (a.rating > b.rating) {
          return -1;
        } else if (b.rating > a.rating) {
          return 1;
        }
      }
    })
    return sorted 
  }




  sortByOpen(entriesToSort) {
    let openEntries = entriesToSort.filter(entry => {
      if (entry.hasOwnProperty('opening_hours') && entry.opening_hours.open_now){
        return entry
      }
    });
    return openEntries
  }


  applyFilters() {
    let operation;
    let entries = this.props.businesses.data;
    let filters = {
      is_open: this.sortByOpen,
      price: this.sortPrioritizePrice,
      rating: this.sortPrioritizeRating,
      favorited: this.sortByFavorited
    }

    for (let filter in filters) { // handle multiple active filters better
      if (this.state.activeFilters[filter] && filter != this.state.sortTypeToIgnore){
        if (filter === 'price') {
          if (this.state.activeFilters.rating) {
            this.state.sortTypeToIgnore = 'rating';
            console.log('prioritizing price ')
            operation = this.sortPrioritizePrice;
          }
        } else if (filter === 'rating') {
          if (this.state.activeFilters[filter] && filter != this.state.sortTypeToIgnore){
            if (this.state.activeFilters.price){
              this.state.sortTypeToIgnore = 'price';
              console.log('prioritizing rating ')
              operation = this.sortPrioritizeRating;
            }
          }
        }

        operation = filters[filter]
        entries = operation(entries)
      }
    }
    return entries;
  }

  updateState(filteredEntries) {
    this.setState({entries: filteredEntries});
  }

  displayBusinessEntries() {
    const { favorites } = this.props;
    return this.state.entries.map((business) => 
      <Link key={business.id} to={`/business/${business.id}`} onClick={(e) => this.props.updateBusiness(e, business)} style={{ textDecoration: 'none' }}>    
      <BusinessEntry business={business}
                     key={business.id}
                     favorite={favorites[business.id] ? true : false} />
      </Link> 
    )
  }

  clickHandler(filter) {
    let toggled = !this.state.activeFilters[filter];
    this.state.activeFilters[filter] = toggled;
    this.state.entries = this.applyFilters();
    let state = this.state;
    this.setState(state)
  }

    render() {
    return (
      <div>
      <div className="filterOptionsBar">
        <button id="filterPrice" className="filterButton" style={this.state.activeFilters.price ? {"backgroundColor": "green"} :  {"backgroundColor": "red"}}  onClick={ () => {
          this.clickHandler('price');
        }}> Price </button>
        <button id="filterOpen" className="filterButton" style={this.state.activeFilters.is_open ? {"backgroundColor": "green"} :  {"backgroundColor": "red"}} onClick={ () => {
          this.clickHandler('is_open');
        }}> Is Open </button>
        <button id="filterRating" className="filterButton" style={this.state.activeFilters.rating ? {"backgroundColor": "green"} :  {"backgroundColor": "red"}} onClick={ () =>{
          this.clickHandler('rating');
        }}> Rating </button>
        <button id="filterFavorited" className="filterButton" style={this.state.activeFilters.favorited ? {"backgroundColor": "green"} :  {"backgroundColor": "red"}} onClick={ () => {
           this.clickHandler('favorited');
         }}> Favorited </button>
      </div>
        {this.displayBusinessEntries()}
      </div>
    )
  }
}

export default BusinessList;