import React from 'react';
import { connect } from 'react-redux';
import { Button, Modal, FormGroup, FormControl } from 'react-bootstrap';
import Select from 'react-select';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import { fetchingOrganizations } from '../../../../../redux/actions/dictionaries/dictionaryActionCreators';
import { fetchSources } from '../../../../../redux/actions/sources/index';
import InlineError from '../messages/InlineError';
import languages from './Languages';

export class DictionaryModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        id: '',
        preffered_source: '',
        public_access: '',
        name: '',
        owner: '',
        description: '',
        default_locale: 'en',
        supported_locales: 'en, es',
        repository_type: 'OpenMRSDictionary',
      },
      errors: {},
      supportedLocalesOptions: [],
    };
  }
  componentDidMount() {
    this.props.fetchingOrganizations();
    const { isEditingDictionary } = this.props;
    if (isEditingDictionary) {
      this.populateFields();
      this.preSelectSupportedLocales();
    }
  }

  onChange = (e) => {
    const { organizations } = this.props;
    const { owner } = this.state.data;
    this.setState({
      data: {
        ...this.state.data,
        owner: (organizations && organizations.length === 0) ? 'Individual' : owner,
        [e.target.name]: e.target.value,
      },
    });
  };

  onSubmit = (e) => {
    e.preventDefault();
    const errors = this.validate(this.state.data);
    this.setState({ errors });
    if (Object.keys(errors).length === 0) {
      this.props
        .submit(this.state.data)
        .then(() => {
          this.props.modalhide();
        })
        .catch((error) => {
          if (error.response) {
            this.setState({
              errors: error.response,
            });
          }
        });
    }
  };

  handleChangeSupportedLocale = (arr) => {
    const supported_locales = [];
    for (let i = 0; i < arr.length; i += 1) {
      supported_locales.push(arr[i].value);
    }
    this.setState({
      data: {
        ...this.state.data,
        supported_locales: supported_locales.toString(),
      },
    });
  };

  populateFields() {
    const {
      dictionary: {
        id, preffered_source, public_access, name, owner, description,
        default_locale, repository_type,
      },
    } = this.props;
    const supportedLocalesOptions = this.preSelectSupportedLocales();
    this.setState({
      data: {
        id,
        preffered_source,
        public_access,
        name,
        owner,
        description,
        default_locale,
        supported_locales: 'en, es',
        repository_type,
      },
      errors: {},
      supportedLocalesOptions,
    });
  }

 preSelectSupportedLocales = () => {
   const {
     dictionary: {
       supported_locales,
     },
   } = this.props;
   if (supported_locales === undefined) {
     return null;
   }
   const supportedLocalesOptions = [];
   for (let i = 0; i < supported_locales.length; i += 1) {
     for (let j = 0; j < languages.length; j += 1) {
       if (supported_locales[i] === languages[j].value) {
         supportedLocalesOptions.push(languages[j]);
       }
     }
   }
   return supportedLocalesOptions;
 }

  validate = (data) => {
    const errors = {};
    if (!data.name) {
      errors.name = 'Dictionary Name cannot be empty';
    }
    if (!data.id) {
      errors.id = 'Short code cannot be empty';
    }
    if (!data.preffered_source) {
      errors.preffered_source = 'Kindly select the preferred source';
    }
    if (!data.owner) {
      errors.owner = 'Kindly select the Owner of the Dictionary';
    }
    if (!data.public_access) {
      errors.public_access =
        'Kindly select the Permissions for your dictionary';
    }
    if (!data.default_locale) {
      errors.default_locale = 'Kindly select your preferred locale';
    }
    return errors;
  };

  render() {
    const { data, errors } = this.state;
    const {
      organizations, dictionary,
      isEditingDictionary, sources,
    } = this.props;
    const publicSources = [...sources];
    return (
      <div className="col-sm-5">
        <Modal

          show={this.props.show}
          onHide={this.props.modalhide}
          dialogClassName="custom-modal"
          className="modal-fade"
        >
          <Modal.Header>
            <Modal.Title className="modal-heading">
              {this.props.title}
            </Modal.Title>
          </Modal.Header>
          {errors && <InlineError text={this.errors} />}
          <Modal.Body>
            <form style={{ marginLeft: '50px', marginRight: '-37%' }}>
              <div className="row">
                <div className="col-md-8">
                  <FormGroup style={{ marginTop: '12px' }}>
                    Preferred Source{' '}
                    {errors && <InlineError text={errors.preffered_sources} />}
                    <FormControl
                      componentClass="select"
                      type="text"
                      id="preferred_source"
                      name="preffered_source"
                      placeholder="CIEL"
                      onChange={this.onChange}
                      value={data.preffered_sources}
                    >
                      <option value="" />
                      <option value="CIEL">CIEL (default source)</option>
                      <option value="PIH">PIH</option>
                      {
                        isEditingDictionary &&
                        <option value={dictionary.preffered_source} selected>
                          {dictionary.preffered_source}
                        </option>
                      }
                      {
                        publicSources.sort((a, b) => a.name > b.name).map(source => (
                          <option value={source.id}>{source.name}</option>
                        ))
                      }
                    </FormControl>
                  </FormGroup>

                  <FormGroup style={{ marginTop: '12px' }}>
                    Preferred Language{''}
                    {errors && <InlineError text={errors.default_locale} />}
                    <FormControl
                      componentClass="select"
                      type="text"
                      name="default_locale"
                      id="default_locale"
                      placeholder="English"
                      onChange={this.onChange}
                    >
                      {isEditingDictionary &&
                        this.props.defaultLocaleOption
                      }
                      {languages &&
                      languages.map(language => (
                        <option value={language.value} key={language.value}>
                          { language.label }
                        </option>
                      ))}
                    </FormControl>
                  </FormGroup>

                  {'Other Languages'}
                  <Select
                    id="supported_locales"
                    closeMenuOnSelect={false}
                    defaultValue={
                      isEditingDictionary ?
                      this.state.supportedLocalesOptions :
                      [languages[0]]}
                    options={languages}
                    isMulti
                    onChange={this.handleChangeSupportedLocale}
                  />

                  <FormGroup style={{ marginTop: '12px' }}>
                    Visibility{''}
                    {errors && <InlineError text={errors.public_access} />}
                    <FormControl
                      componentClass="select"
                      type="text"
                      id="public_access"
                      placeholder="Private"
                      name="public_access"
                      onChange={this.onChange}
                      value={data.public_access}
                    >
                      <option value="" />
                      {(isEditingDictionary && dictionary.public_access === 'View') &&
                      <option value="View" selected>Private </option>
                      }
                      <option value="Edit">Public</option>
                      <option value="View">Private</option>
                    </FormControl>
                  </FormGroup>

                  <FormGroup style={{ marginTop: '12px' }}>
                    Dictionary Name{''}
                    {errors && <InlineError text={errors.name} />}
                    <FormControl
                      type="text"
                      id="dictionary_name"
                      onChange={this.onChange}
                      name="name"
                      placeholder="e.g Community Health Dictionary"
                      value={data.name}
                      required
                    />
                  </FormGroup>
                  <FormGroup style={{ marginTop: '12px' }}>
                    Owner {errors && <InlineError text={errors.owner} />}
                    <FormControl
                      componentClass="select"
                      type="text"
                      id="owner"
                      placeholder="Individual"
                      name="owner"
                      onChange={this.onChange}
                      value={data.owner}
                    >
                      {isEditingDictionary &&
                      <option value={data.owner} selected>{data.owner}</option>
                      }
                      { organizations && organizations.length !== 0 && <option value="" />}
                      <option value="Individual" style={{ textTransform: 'capitalize' }}> {localStorage.getItem('username')} (Yourself) </option>
                      {organizations &&
                        organizations.map(organization => (
                          <option value={organization.id} key={organization.id}>
                            {organization.id}{' '} (organization)
                          </option>
                        ))}
                    </FormControl>
                  </FormGroup>
                  <FormGroup
                    style={{ marginTop: '12px' }}
                    data-toggle="tooltip"
                    data-placement="top"
                    title="Short Code"
                  >
                    Short Code
                    {errors && <InlineError text={errors.id} />}
                    <FormControl
                      type="text"
                      id="dictionary_short_code"
                      name="id"
                      onChange={this.onChange}
                      value={data.id}
                      placeholder="e.g Community-MCH, Only Alphanumeric Characters
                      Allowed"
                      data-tip="Mnemonic used to identify the collection in the URL (usually an acronym e.g. Community-MCH)"
                      required
                    />
                    <ReactTooltip place="top" effect="solid" />
                  </FormGroup>
                  <FormGroup style={{ marginTop: '12px' }}>
                    Description{' '}
                    <FormControl
                      componentClass="textarea"
                      id="dictionary_description"
                      name="description"
                      onChange={this.onChange}
                      value={data.description}
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormControl
                      type="hidden"
                      id="repository_type"
                      name="repository_type"
                      value="OpenMRSDictionary"
                    />
                  </FormGroup>
                </div>
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              className="btn btn-outline-info"
              id="addDictionary"
              onClick={this.onSubmit}
            >
              {this.props.buttonname}{' '}
            </Button>
            <Button
              className="btn btn-outline-danger test-btn-cancel"
              id="cancel"
              onClick={this.props.modalhide}
            >
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
DictionaryModal.propTypes = {
  title: PropTypes.string,
  show: PropTypes.bool,
  buttonname: PropTypes.string,
  fetchingOrganizations: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
  organizations: PropTypes.object.isRequired,
  dictionary: PropTypes.object.isRequired,
  modalhide: PropTypes.func.isRequired,
  defaultLocaleOption: PropTypes.object.isRequired,
  isEditingDictionary: PropTypes.object.isRequired,
  sources: PropTypes.array.isRequired,
};

DictionaryModal.defaultProps = {
  title: 'Add Dictionary',
  show: false,
  buttonname: 'Add Dictionary',
};

function mapStateToProps(state) {
  return {
    organizations: state.organizations.organizations,
    sources: state.sources.sources,
  };
}
export default connect(
  mapStateToProps,
  { fetchingOrganizations, fetchSources },
)(DictionaryModal);
